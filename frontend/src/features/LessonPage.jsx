import { useEffect, useState } from 'react'
import { ArrowLeft, ArrowRight, Bookmark, Check, CheckCircle2, Circle, Clock3, Code2, Lightbulb, LockKeyhole, Play, Sparkles } from 'lucide-react'
import { api } from '../lib/api.js'

export default function LessonPage({ slug, modules, authenticated, onRequireAuth, onNavigateLesson, onComplete, onBack, onOpenArena }) {
  const [lesson, setLesson] = useState(null)
  const [error, setError] = useState('')
  const [answer, setAnswer] = useState(null)
  const [feedback, setFeedback] = useState(null)
  const [busy, setBusy] = useState(false)
  const [experiment, setExperiment] = useState(7)

  useEffect(() => {
    setLesson(null); setError(''); setAnswer(null); setFeedback(null)
    api.lesson(slug).then(setLesson).catch((reason) => setError(reason.message))
  }, [slug])

  const actions = async (action, extra = {}) => {
    if (!authenticated) { onRequireAuth(); return }
    setBusy(true); setError('')
    try {
      const result = await api.progress(lesson.id, { action, ...extra })
      if (action === 'check') setFeedback(result)
      else { setLesson((current) => ({ ...current, completed: result.completed, bookmarked: result.bookmarked })); onComplete?.(result) }
    } catch (reason) { setError(reason.message) }
    finally { setBusy(false) }
  }

  if (error && !lesson) return <div className="lesson-state"><h1>Lesson unavailable</h1><p>{error}</p></div>
  if (!lesson) return <div className="lesson-state">Loading your lesson…</div>
  const module = modules.find((item) => item.id === lesson.module)
  const lessons = module?.lessons || []
  const position = lessons.findIndex((item) => item.id === lesson.id)
  const previous = position > 0 ? lessons[position - 1] : null
  const next = position >= 0 && position < lessons.length - 1 ? lessons[position + 1] : null

  return <article className="lesson-page">
    <div className="lesson-topline"><button className="text-link" onClick={onBack}><ArrowLeft size={14} /> Learning path</button><span>{lesson.module_title}</span></div>
    <div className="lesson-heading"><div className="panel-kicker">WORLD {String(module?.number || 1).padStart(2, '0')} · LESSON {lesson.order}</div><h1>{lesson.title}</h1><div className="lesson-tags"><span><Clock3 size={13} /> {lesson.duration_minutes} min</span><span>{lesson.difficulty}</span><span><Sparkles size={13} /> +{lesson.xp_reward} XP</span><button className={`bookmark-button ${lesson.bookmarked ? 'is-bookmarked' : ''}`} disabled={busy} onClick={() => actions(lesson.bookmarked ? 'unbookmark' : 'bookmark')}><Bookmark size={14} fill={lesson.bookmarked ? 'currentColor' : 'none'} /> {lesson.bookmarked ? 'Saved' : 'Bookmark'}</button></div></div>
    <div className="lesson-layout"><div className="lesson-content">
      <section className="lesson-section"><div className="lesson-section-title"><span className="lesson-step">01</span><div><div className="panel-kicker">THE IDEA</div><h2>What it means</h2></div></div><p>{lesson.concept}</p></section>
      <section className="lesson-section analogy-box"><div className="lesson-section-title"><span className="lesson-step analogy-step"><Lightbulb size={16} /></span><div><div className="panel-kicker">A WAY TO PICTURE IT</div><h2>Real-world analogy</h2></div></div><p>{lesson.analogy}</p></section>
      <section className="lesson-section"><div className="lesson-section-title"><span className="lesson-step">02</span><div><div className="panel-kicker">WATCH THE STATE CHANGE</div><h2>Visual demonstration</h2></div></div><p>{lesson.demonstration}</p><ol className="lesson-steps">{lesson.steps.map((step, index) => <li key={index}><span>{index + 1}</span>{step}</li>)}</ol></section>
      <section className="lesson-section"><div className="lesson-section-title"><span className="lesson-step code-step"><Code2 size={15} /></span><div><div className="panel-kicker">PYTHON IMPLEMENTATION</div><h2>See it in code</h2></div></div><pre className="lesson-code"><code>{lesson.python_code}</code></pre><p>{lesson.code_explanation}</p></section>
      <section className="lesson-section"><div className="lesson-section-title"><span className="lesson-step">03</span><div><div className="panel-kicker">TRACE IT YOURSELF</div><h2>Dry run</h2></div></div><div className="dry-run-table">{lesson.dry_run.map((row, index) => <div key={index}><span>{index + 1}</span><code>{JSON.stringify(row)}</code></div>)}</div></section>
      <section className="lesson-section experiment-box"><div className="lesson-section-title"><span className="lesson-step"><Play size={14} /></span><div><div className="panel-kicker">INTERACTIVE EXPERIMENT</div><h2>Change a value</h2></div></div><p>{lesson.experiment_prompt}</p><div className="experiment-control"><label htmlFor="experiment-value">Try a different starting value</label><input id="experiment-value" type="number" value={experiment} onChange={(event) => setExperiment(Number(event.target.value))} /><span>New value: <strong>{experiment}</strong></span></div>{lesson.slug.includes('variables-and-values') && <div className="experiment-result"><code>score = {experiment}; score += 3; print(score)</code><span>Output <strong>{experiment + 3}</strong></span></div>}</section>
      <section className="lesson-section quiz-box"><div className="lesson-section-title"><span className="lesson-step quiz-step"><Circle size={15} /></span><div><div className="panel-kicker">QUICK KNOWLEDGE CHECK</div><h2>{lesson.check_question}</h2></div></div><div className="quiz-options">{lesson.check_options.map((option, index) => <button key={index} className={`quiz-option ${answer === index ? 'selected' : ''} ${feedback && answer === index ? feedback.correct ? 'correct' : 'incorrect' : ''}`} disabled={busy || !!feedback} onClick={() => setAnswer(index)}><span>{String.fromCharCode(65 + index)}</span>{option}{feedback && answer === index && (feedback.correct ? <CheckCircle2 size={16} /> : <Circle size={16} />)}</button>)}</div>{error && <div className="auth-error">{error}</div>}{feedback ? <div className={`quiz-feedback ${feedback.correct ? 'feedback-good' : 'feedback-try'}`}>{feedback.correct ? 'That’s right. ' : 'Not quite. '}{feedback.explanation}</div> : <button className="primary-button" disabled={answer === null || busy} onClick={() => actions('check', { answer })}>Check answer <ArrowRight size={14} /></button>}</section>
      <section className="lesson-section assignment-box"><div className="panel-kicker">YOUR PRACTICE CHALLENGE</div><h2>Now make it yours</h2><p>{lesson.assignment_prompt}</p><button className="subtle-button" onClick={onOpenArena}><Code2 size={13} /> Open coding arena <ArrowRight size={13} /></button></section>
      <div className="lesson-footer"><button className="subtle-button" disabled={!previous} onClick={() => previous && onNavigateLesson(previous.slug)}><ArrowLeft size={14} /> Previous</button>{lesson.completed ? <span className="completion-label"><Check size={15} /> Lesson complete</span> : <button className="primary-button" disabled={busy} onClick={() => actions('complete')}>Mark lesson complete <Check size={15} /></button>}<button className="subtle-button" disabled={!next} onClick={() => next && onNavigateLesson(next.slug)}>Next <ArrowRight size={14} /></button></div>
    </div><aside className="lesson-aside"><div className="lesson-aside-title"><div className="panel-kicker">IN THIS LESSON</div><h3>Your checkpoints</h3></div>{['Understand the idea', 'Trace an example', 'Read the Python', 'Try the experiment', 'Pass the check'].map((label, index) => <div className="checkpoint" key={label}><span>{index === 0 && lesson.completed ? <Check size={13} /> : index + 1}</span>{label}</div>)}<div className="aside-reward"><Sparkles size={15} /><div><strong>+{lesson.xp_reward} XP</strong><small>Earned once when completed</small></div></div></aside></div>
  </article>
}
