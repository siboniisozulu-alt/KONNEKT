
import React, { useCallback, useEffect, useState } from 'react';
import {
  View, Text, TouchableOpacity, ScrollView,
  StyleSheet, ActivityIndicator, Alert
} from 'react-native';
import { useAuth } from '../AuthContext';
import { supabase } from '../lib_supabase';

export default function AdminModerationScreen({ navigation }) {
  const { user } = useAuth();
  const [authorized, setAuthorized] = useState(false);
  const [checking, setChecking] = useState(true);
  const [reports, setReports] = useState([]);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState('');

  const load = useCallback(async () => {
    if (!user?.id) {
      setChecking(false);
      return;
    }

    setBusy(true);
    setNotice('');

    try {
      const { data: admin, error: adminError } = await supabase
        .from('moderation_admins')
        .select('user_id')
        .eq('user_id', user.id)
        .maybeSingle();

      if (adminError) throw adminError;

      setAuthorized(!!admin);

      if (!admin) {
        setReports([]);
        return;
      }

      const { data, error } = await supabase
        .from('user_reports')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;

      setReports(data || []);
    } catch (error) {
      setNotice(error.message || 'Could not load moderation queue.');
    } finally {
      setBusy(false);
      setChecking(false);
    }
  }, [user?.id]);

  useEffect(() => {
    load();
  }, [load]);

  const updateReport = (report, status) => {
    if (!user?.id || !report?.id) return;

    Alert.alert(
      'Update report',
      `Mark this report as ${status}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm',
          onPress: async () => {
            setBusy(true);
            setNotice('');

            try {
              const now = new Date().toISOString();

              const { error: reportError } = await supabase
                .from('user_reports')
                .update({
                  status,
                  moderator_id: user.id,
                  reviewed_at: now
                })
                .eq('id', report.id);

              if (reportError) throw reportError;

              const actionByStatus = {
                reviewing: null,
                actioned: 'report_actioned',
                dismissed: 'report_dismissed'
              };

              const action = actionByStatus[status];

              if (action) {
                const { error: logError } = await supabase
                  .from('moderation_actions')
                  .insert({
                    moderator_id: user.id,
                    target_user_id: report.reported_user_id,
                    report_id: report.id,
                    action,
                    reason: `Report marked ${status}`
                  });

                if (logError) throw logError;
              }

              await load();
            } catch (error) {
              setNotice(
                error.message || 'Could not update report.'
              );
            } finally {
              setBusy(false);
            }
          }
        }
      ]
    );
  };

  if (checking) {
    return (
      <View style={s.center}>
        <ActivityIndicator color="#167BFF" />
      </View>
    );
  }

  if (!authorized) {
    return (
      <View style={s.center}>
        <Text style={s.title}>Moderator access required</Text>
        <Text style={s.info}>
          This account is not on the KONNEKT moderator allowlist.
          A project owner must add its user ID.
        </Text>
        <TouchableOpacity
          style={s.button}
          onPress={() => navigation.goBack()}
        >
          <Text style={s.buttonText}>Go back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={s.container}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={s.back}>‹</Text>
        </TouchableOpacity>

        <Text style={s.title}>Safety & moderation</Text>

        <TouchableOpacity onPress={load} disabled={busy}>
          <Text style={s.refresh}>↻</Text>
        </TouchableOpacity>
      </View>

      <Text style={s.info}>
        Review reports fairly. Record only necessary moderation actions.
        Actioning a report does not automatically suspend an account
        or remove content.
      </Text>

      {busy ? (
        <ActivityIndicator color="#167BFF" />
      ) : (
        <ScrollView contentContainerStyle={{ paddingBottom: 30 }}>
          {reports.map(report => (
            <View key={report.id} style={s.card}>
              <Text style={s.reportTitle}>
                {report.reason} · {report.status}
              </Text>

              <Text style={s.meta}>
                Type: {report.content_type} ·{' '}
                {new Date(report.created_at).toLocaleString()}
              </Text>

              <Text style={s.body}>
                {report.details || 'No additional details supplied.'}
              </Text>

              <Text style={s.meta}>
                Reported account: {report.reported_user_id || 'Not specified'}
              </Text>

              {(report.status === 'open' ||
                report.status === 'reviewing') && (
                <View style={s.actions}>
                  <TouchableOpacity
                    style={s.review}
                    onPress={() => updateReport(report, 'reviewing')}
                  >
                    <Text style={s.buttonText}>Reviewing</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={s.resolve}
                    onPress={() => updateReport(report, 'actioned')}
                  >
                    <Text style={s.buttonText}>Actioned</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={s.dismiss}
                    onPress={() => updateReport(report, 'dismissed')}
                  >
                    <Text style={s.buttonText}>Dismiss</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          ))}

          {!reports.length && (
            <Text style={s.info}>No reports in the queue.</Text>
          )}
        </ScrollView>
      )}

      {!!notice && <Text style={s.error}>{notice}</Text>}
    </View>
  );
}

const s = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#080B14',
    padding: 18
  },
  center: {
    flex: 1,
    backgroundColor: '#080B14',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24
  },
  header: {
    marginTop: 22,
    marginBottom: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  back: {
    color: '#167BFF',
    fontSize: 32
  },
  title: {
    color: '#FFF',
    fontSize: 22,
    fontWeight: 'bold'
  },
  refresh: {
    color: '#A9B8FF',
    fontSize: 24
  },
  info: {
    color: '#9EB0C4',
    lineHeight: 20,
    marginBottom: 14,
    textAlign: 'center'
  },
  card: {
    backgroundColor: '#151C2E',
    borderRadius: 13,
    padding: 14,
    marginBottom: 12
  },
  reportTitle: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 15
  },
  meta: {
    color: '#A9B8FF',
    fontSize: 10,
    marginTop: 7
  },
  body: {
    color: '#D5E2F0',
    lineHeight: 19,
    marginTop: 10
  },
  actions: {
    flexDirection: 'row',
    gap: 7,
    marginTop: 13,
    flexWrap: 'wrap'
  },
  review: {
    backgroundColor: '#31506D',
    padding: 10,
    borderRadius: 8
  },
  resolve: {
    backgroundColor: '#147C60',
    padding: 10,
    borderRadius: 8
  },
  dismiss: {
    backgroundColor: '#7A3342',
    padding: 10,
    borderRadius: 8
  },
  button: {
    backgroundColor: '#167BFF',
    padding: 13,
    borderRadius: 10,
    marginTop: 16
  },
  buttonText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 11
  },
  error: {
    color: '#FF9CA8',
    marginTop: 12
  }
});
