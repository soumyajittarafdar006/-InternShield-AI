import React, { useState, useEffect } from 'react';
import { RefreshCw, AlertTriangle } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { getModelPerformance, API_BASE_URL } from '../services/api';
import { pct } from '../lib/risk';
import { Panel, PageHeader, Notice, Spinner, Tag } from '../components/ui';

const fmt = (v) => (typeof v === 'number' ? `${v.toFixed(2)}%` : '—');
const num = (v) => (typeof v === 'number' ? v : '—');
const TICK = { fill: '#64748B', fontSize: 11, fontFamily: 'IBM Plex Mono' };

export default function ModelPerformancePage() {
  const [metricsData, setMetricsData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedModel, setSelectedModel] = useState('Logistic Regression');
  const [isRetraining, setIsRetraining] = useState(false);
  const [retrainError, setRetrainError] = useState('');

  const fetchMetrics = async () => {
    setIsLoading(true);
    try {
      setMetricsData(await getModelPerformance());
    } catch (err) {
      console.error('Error loading metrics:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
  }, []);

  const handleRetrain = async () => {
    setIsRetraining(true);
    setRetrainError('');
    try {
      const res = await fetch(`${API_BASE_URL}/train`, { method: 'POST' });
      if (!res.ok) throw new Error(`Server responded with ${res.status}`);
      await fetchMetrics();
    } catch {
      setRetrainError('Could not reach the analysis server to re-run the evaluation. Start the Flask backend and try again.');
    } finally {
      setIsRetraining(false);
    }
  };

  if (isLoading && !metricsData) {
    return (
      <div className="page flex items-center gap-3 py-20 text-sm text-muted">
        <Spinner className="h-4 w-4" />
        Loading benchmark metrics…
      </div>
    );
  }

  if (!metricsData || metricsData.status === 'not_trained') {
    return (
      <div className="page max-w-2xl space-y-4 py-16">
        <Notice tone="caution" icon={AlertTriangle} title="No trained model found">
          Metrics are never invented. Train the models on the benchmark dataset to see real results here.
        </Notice>
        {retrainError && <Notice tone="danger">{retrainError}</Notice>}
        <button type="button" onClick={handleRetrain} disabled={isRetraining} className="btn btn-primary">
          {isRetraining ? <Spinner /> : <RefreshCw className="h-4 w-4" />}
          {isRetraining ? 'Training…' : 'Train models'}
        </button>
      </div>
    );
  }

  const { dataset_info: ds = {}, models = {}, explainability } = metricsData;
  const names = Object.keys(models);
  const primary = metricsData.primary_model || 'Logistic Regression';
  const isSnapshot = metricsData.source === 'bundled_snapshot';
  const active = models[selectedModel];
  const cm = active?.confusion_matrix || {};
  const tn = cm.true_negative, fp = cm.false_positive, fn = cm.false_negative, tp = cm.true_positive;
  const testSize = ds.test_size;
  const fakeShare = pct(ds.fake_samples, ds.total_samples);

  const errorData = names.map((n) => ({
    name: n,
    'False positives': models[n].confusion_matrix?.false_positive ?? 0,
    'False negatives': models[n].confusion_matrix?.false_negative ?? 0,
  }));

  return (
    <div className="page space-y-6 py-8">
      <PageHeader
        eyebrow="ML performance"
        title="Model benchmark"
        description={`Four classifiers trained on TF-IDF features and compared on a held-out test set${ds.split_ratio ? ` (${ds.split_ratio} split)` : ''}.`}
        actions={
          <button type="button" onClick={handleRetrain} disabled={isRetraining} className="btn btn-secondary">
            {isRetraining ? <Spinner /> : <RefreshCw className="h-4 w-4" />}
            {isRetraining ? 'Re-running…' : 'Re-run evaluation'}
          </button>
        }
      />

      {isSnapshot && (
        <Notice tone="caution" title="Showing the metrics snapshot bundled with the app">
          The analysis server is unreachable, so these figures are not live. Start the backend and use Re-run evaluation to refresh them from the current model.
        </Notice>
      )}
      {retrainError && <Notice tone="danger">{retrainError}</Notice>}

      {/* Dataset */}
      <Panel title="Dataset and split" bodyClassName="">
        <dl className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6">
          {[
            ['Total posts', num(ds.total_samples), ''],
            ['Real', num(ds.real_samples), pct(ds.real_samples, ds.total_samples)],
            ['Fake', num(ds.fake_samples), fakeShare],
            ['Train', num(ds.train_size), pct(ds.train_size, ds.total_samples)],
            ['Test', num(ds.test_size), pct(ds.test_size, ds.total_samples)],
            ['TF-IDF features', num(ds.feature_count), '1–2 word n-grams'],
          ].map(([label, value, note]) => (
            <div key={label} className="border-b border-r border-line p-4 last:border-r-0 lg:border-b-0">
              <dt className="text-xs font-semibold text-muted">{label}</dt>
              <dd className="num mt-1 text-xl font-medium">{value}</dd>
              <p className="font-mono text-[11px] text-muted">{note || ' '}</p>
            </div>
          ))}
        </dl>
        <p className="border-t border-line px-5 py-3 text-xs leading-5 text-muted">
          {typeof testSize === 'number' && testSize > 0 ? (
            <>One misclassified post moves accuracy by about {(100 / testSize).toFixed(1)} points on a test set of {testSize}. A score of 100% on a set this small should be read with caution. </>
          ) : null}
          {fakeShare && <>This evaluation set is {fakeShare} fake, far higher than real-world job boards (the public EMSCAD corpus has 866 fraudulent postings among 17,880), so precision here will be higher than in everyday use.</>}
        </p>
      </Panel>

      {/* Comparison */}
      <Panel title="Algorithm comparison" description="Fake is the positive class. Select a model to inspect its confusion matrix." bodyClassName="">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[40rem] text-left text-sm">
            <thead className="border-b border-line bg-canvas text-xs text-muted">
              <tr>
                <th className="px-5 py-2.5 font-semibold">Model</th>
                <th className="px-3 py-2.5 text-right font-semibold">Accuracy</th>
                <th className="px-3 py-2.5 text-right font-semibold">Precision</th>
                <th className="px-3 py-2.5 text-right font-semibold">Recall</th>
                <th className="px-3 py-2.5 text-right font-semibold">F1</th>
                <th className="px-3 py-2.5 text-right font-semibold">False pos.</th>
                <th className="px-5 py-2.5 text-right font-semibold">False neg.</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {names.map((n) => {
                const m = models[n];
                const sel = n === selectedModel;
                return (
                  <tr key={n} className={sel ? 'bg-canvas' : 'hover:bg-canvas'}>
                    <td className="px-5 py-3">
                      <button type="button" onClick={() => setSelectedModel(n)} aria-pressed={sel} className={`text-left font-semibold ${sel ? 'text-navy' : 'text-ink hover:text-navy'}`}>
                        {n}
                      </button>
                      {n === primary && <span className="ml-2"><Tag tone="navy">Primary</Tag></span>}
                    </td>
                    <td className="num px-3 py-3 text-right">{fmt(m.accuracy)}</td>
                    <td className="num px-3 py-3 text-right">{fmt(m.precision_fake)}</td>
                    <td className="num px-3 py-3 text-right">{fmt(m.recall_fake)}</td>
                    <td className="num px-3 py-3 text-right">{fmt(m.f1_fake)}</td>
                    <td className="num px-3 py-3 text-right">{num(m.confusion_matrix?.false_positive)}</td>
                    <td className="num px-5 py-3 text-right">{num(m.confusion_matrix?.false_negative)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="border-t border-line p-5">
          <p className="mb-3 text-xs font-semibold text-muted">Misclassified test posts by model</p>
          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={errorData} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
                <CartesianGrid vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="name" tickLine={false} axisLine={{ stroke: '#E2E8F0' }} tick={TICK} />
                <YAxis allowDecimals={false} tickLine={false} axisLine={false} tick={TICK} />
                <Tooltip cursor={{ fill: '#F7F8FA' }} contentStyle={{ border: '1px solid #E2E8F0', borderRadius: 6, fontSize: 12, boxShadow: 'none' }} />
                <Legend iconType="square" wrapperStyle={{ fontSize: 12 }} />
                <Bar dataKey="False positives" fill="#D97706" maxBarSize={28} radius={[4, 4, 0, 0]} isAnimationActive={false} />
                <Bar dataKey="False negatives" fill="#DC4444" maxBarSize={28} radius={[4, 4, 0, 0]} isAnimationActive={false} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </Panel>

      {/* Inspector */}
      {active && (
        <div className="grid items-start gap-6 lg:grid-cols-2">
          <Panel title={`Confusion matrix: ${selectedModel}`} description={typeof testSize === 'number' ? `${testSize} test posts` : undefined} bodyClassName="p-5">
            <table className="w-full border-collapse text-center text-sm">
              <thead>
                <tr>
                  <th className="p-2" />
                  <th className="border border-line bg-canvas p-2 text-xs font-semibold text-muted">Predicted real</th>
                  <th className="border border-line bg-canvas p-2 text-xs font-semibold text-muted">Predicted fake</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <th className="border border-line bg-canvas p-3 text-left text-xs font-semibold text-muted">Actually real</th>
                  <td className="border border-line bg-verified-soft p-4"><span className="num block text-xl text-verified-ink">{num(tn)}</span><span className="text-xs text-muted">True negative</span></td>
                  <td className="border border-line bg-caution-soft p-4"><span className="num block text-xl text-caution-ink">{num(fp)}</span><span className="text-xs text-muted">False positive</span></td>
                </tr>
                <tr>
                  <th className="border border-line bg-canvas p-3 text-left text-xs font-semibold text-muted">Actually fake</th>
                  <td className="border border-line bg-danger-soft p-4"><span className="num block text-xl text-danger-ink">{num(fn)}</span><span className="text-xs text-muted">False negative</span></td>
                  <td className="border border-line bg-verified-soft p-4"><span className="num block text-xl text-verified-ink">{num(tp)}</span><span className="text-xs text-muted">True positive</span></td>
                </tr>
              </tbody>
            </table>
            {[tn, fp, fn, tp].every((v) => typeof v === 'number') && (
              <p className="mt-4 text-sm text-muted">
                Caught {tp} of {tp + fn} fraudulent test posts and wrongly flagged {fp} of {tn + fp} genuine ones.
              </p>
            )}
          </Panel>

          <Panel title="Why recall on the fake class matters most">
            <div className="space-y-3 text-sm text-muted">
              <p>Accuracy alone can mislead when fraud is rare: a model that always answers "real" would score well on a typical job board while protecting no one.</p>
              <p className="rounded-md border border-line bg-canvas px-3 py-2 font-mono text-xs text-ink">Recall = TP / (TP + FN) = scams caught / all actual scams</p>
              <p>A false positive sends a student to double-check a genuine offer. A false negative lets a scam through. The second is the costlier mistake, so recall is read first and precision second.</p>
            </div>
          </Panel>
        </div>
      )}

      {/* Signals */}
      {explainability && (
        <Panel title="Strongest text signals" description={`Highest-weight terms in the ${primary} model (TF-IDF coefficients).`} bodyClassName="">
          <div className="grid md:grid-cols-2 md:divide-x md:divide-line">
            {[
              ['Predict fake', explainability.top_fake_signals, '+', 'text-danger-ink'],
              ['Predict real', explainability.top_real_signals, '−', 'text-verified-ink'],
            ].map(([title, list, sign, color]) => (
              <div key={title} className="p-5">
                <h3 className="mb-2 text-xs font-semibold text-muted">{title}</h3>
                <ul className="divide-y divide-line">
                  {(list || []).slice(0, 8).map((s, i) => (
                    <li key={i} className="flex items-center justify-between py-2 text-sm">
                      <span className="font-mono text-[13px]">{s.keyword}</span>
                      <span className={`num ${color}`}>{sign}{Math.abs(Number(s.weight)).toFixed(2)}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </Panel>
      )}
    </div>
  );
}
