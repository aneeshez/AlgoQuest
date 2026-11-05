import { useEffect, useMemo, useState } from 'react'
import { ArrowLeft, ArrowRight, Binary, Braces, GitBranch, Layers3, Network, Play, RotateCcw, Sparkles, Trees, Waypoints, Zap } from 'lucide-react'
import { buildSortTrace } from './sorting.js'
import { api } from '../lib/api.js'

const games = [
  { id: 'quest', title: 'Restore the data relay', topic: 'Story quest', detail: 'Help a town deliver medicine using graphs, queues, and search.', icon: Sparkles, color: 'amber' },
  { id: 'sort', title: 'Sorting master', topic: 'Sorting', detail: 'Compare four sorting strategies step by step.', icon: Layers3, color: 'violet' },
  { id: 'search', title: 'Binary search hunter', topic: 'Arrays', detail: 'Find a hidden target by cutting the range in half.', icon: Binary, color: 'blue' },
  { id: 'stack', title: 'Stack escape', topic: 'Stacks', detail: 'Solve a small puzzle with last in, first out.', icon: Layers3, color: 'rose' },
  { id: 'queue', title: 'Queue challenge', topic: 'Queues', detail: 'Keep arrivals in order as you serve the line.', icon: Waypoints, color: 'cyan' },
  { id: 'list', title: 'Linked list builder', topic: 'Linked lists', detail: 'Insert, remove, and reverse a chain of nodes.', icon: GitBranch, color: 'amber' },
  { id: 'tree', title: 'Tree builder', topic: 'Trees', detail: 'Build a search tree and choose a traversal.', icon: Trees, color: 'green' },
  { id: 'graph', title: 'Graph explorer', topic: 'Graphs', detail: 'Explore a network with BFS or DFS.', icon: Network, color: 'blue' },
  { id: 'dp', title: 'DP dungeon', topic: 'Dynamic programming', detail: 'Compare memoization with a bottom-up table.', icon: Braces, color: 'violet' },
]
const base = [12, 7, 18, 5, 14, 9]

export default function GameHub({ authenticated = false, onQuestReward = () => {}, onRequireAuth = () => {} }) {
  const [game, setGame] = useState('')
  return <div className="gamehub">
    <div className="eyebrow"><span className="eyebrow-line" /> THE TRAINING GROUNDS <span className="eyebrow-line" /></div>
    {!game ? <><h1>Play your way to <span className="gradient-text">understanding.</span></h1><p className="welcome-sub">Every puzzle makes an algorithm visible. Try a move, see what changes, and learn the rule behind it.</p><div className="gamehub-grid">{games.map(({ id, title, topic, detail, icon: Icon, color }) => <button className="game-tile" key={id} onClick={() => setGame(id)}><div className={`game-tile-icon tone-${color}`}><Icon size={19} /></div><div className="game-tile-topic">{topic}</div><h2>{title}</h2><p>{detail}</p><span className="game-tile-link">Enter game <ArrowRight size={13} /></span></button>)}</div></> : <div className="game-stage"><button className="text-link game-back" onClick={() => setGame('')}><ArrowLeft size={14} /> All games</button>{game === 'quest' ? <StoryQuest authenticated={authenticated} onReward={onQuestReward} onRequireAuth={onRequireAuth} /> : game === 'sort' ? <SortGame /> : game === 'search' ? <SearchGame /> : game === 'stack' ? <StackGame /> : game === 'queue' ? <QueueGame /> : game === 'list' ? <LinkedListGame /> : game === 'tree' ? <TreeGame /> : game === 'graph' ? <GraphGame /> : <DPGame />}</div>}
  </div>
}

function GameCard({ topic, title, intro, children }) { return <section className="game-play-panel"><div className="panel-kicker">{topic.toUpperCase()}</div><h2>{title}</h2><p>{intro}</p>{children}</section> }
const questStages = [
  { title: 'Find the clinic', concept: 'BFS · shortest path in an unweighted graph', story: 'The town map connects the Relay to the Clinic through North in two roads, or through East and Market in three. Which search guarantees the route with the fewest roads?', answer: 'bfs', options: [{ id: 'bfs', label: 'Breadth-first search (BFS)' }, { id: 'dfs', label: 'Depth-first search (DFS)' }] },
  { title: 'Serve the medicine line', concept: 'Queue · first in, first out', story: 'Three clinics call for medicine in this order: Cedar, Birch, Maple. The courier can serve one request at a time. Which structure keeps the arrival order?', answer: 'queue', options: [{ id: 'stack', label: 'A stack: serve the newest request first' }, { id: 'queue', label: 'A queue: serve the oldest request first' }] },
  { title: 'Locate the final supply box', concept: 'Binary search · halve a sorted range', story: 'Supply IDs are sorted: 14, 21, 28, 35, 42, 49, 56, 63. You check the midpoint, 35, and need ID 49. Which half should you search next?', answer: 'binary-search', options: [{ id: 'left', label: 'Keep the lower half: 14 through 35' }, { id: 'binary-search', label: 'Keep the upper half: 42 through 63' }] },
]

function StoryQuest({ authenticated, onReward, onRequireAuth }) {
  const [step, setStep] = useState(0)
  const [choice, setChoice] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(authenticated)
  const [busy, setBusy] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')
  useEffect(() => {
    if (!authenticated) { setLoading(false); return }
    api.questProgress().then((progress) => { setStep(progress.currentStep); setSaved(progress.completed) }).catch((loadError) => setError(loadError.message)).finally(() => setLoading(false))
  }, [authenticated])
  const complete = async () => {
    if (!choice || busy) return
    const stage = questStages[step]
    setBusy(true); setMessage('')
    try {
      if (authenticated) {
        const result = await api.questStep(step, choice)
        if (!result.correct) { setMessage('That choice does not fit this part of the route. Re-read the scenario and try again.'); return }
        setStep(result.currentStep); setSaved(result.completed)
        setMessage(result.completed ? 'The delivery is complete. You earned 15 XP for this story quest.' : result.feedback)
        if (result.completed && !result.alreadyComplete) onReward()
      } else if (choice === stage.answer) {
        const next = step + 1; setStep(next); setMessage(next === questStages.length ? 'The delivery is complete. Sign in to save progress and earn quest XP.' : 'Good call. Move on to the next part of the rescue.')
      } else setMessage('That choice does not fit this part of the route. Re-read the scenario and try again.')
      setChoice('')
    } catch (submitError) { setError(submitError.message) }
    finally { setBusy(false) }
  }
  if (loading) return <div className="game-play-panel">Loading your saved quest…</div>
  if (error) return <div className="game-play-panel" role="alert">{error}</div>
  if (step >= questStages.length) return <GameCard topic="STORY QUEST COMPLETE" title="The town is back online." intro="You found the shortest route with BFS, kept medicine requests in FIFO order with a queue, and narrowed the sorted supply list with binary search."><div className="game-feedback"><Sparkles size={14} />{saved ? 'Progress saved. This quest awards 15 XP once per account.' : 'Quest complete.'}</div>{!authenticated && <button className="primary-button mt-4" onClick={onRequireAuth}>Sign in to save progress and earn XP</button>}</GameCard>
  const current = questStages[step]
  return <GameCard topic={`STORY QUEST · PART ${step + 1} OF ${questStages.length}`} title="Restore the data relay" intro="A storm has cut the town off from its medicine depot. Use the right data structure at each step to get supplies through safely."><div className="panel-kicker">{current.concept}</div><h3 className="mt-3 text-sm font-semibold">{current.title}</h3><p className="welcome-sub mt-2">{current.story}</p><div className="game-actions mt-4">{current.options.map((option) => <button key={option.id} className={`secondary-button ${choice === option.id ? 'active-game-mode' : ''}`} onClick={() => setChoice(option.id)}>{option.label}</button>)}<button className="primary-button" disabled={!choice || busy} onClick={complete}>{busy ? 'Checking…' : 'Choose this route'} <ArrowRight size={13} /></button></div>{message && <div className="game-feedback mt-4" role="status">{message}</div>}</GameCard>
}
function SortGame() {
  const [values, setValues] = useState(base)
  const [algorithm, setAlgorithm] = useState('Bubble sort')
  const [step, setStep] = useState(0)
  const [autoplay, setAutoplay] = useState(false)
  const trace = useMemo(() => buildSortTrace(values, algorithm), [values, algorithm])
  const frame = step ? trace[Math.min(step - 1, trace.length - 1)] : { values, comparisons: 0, swaps: 0, pair: [] }
  useEffect(() => { if (!autoplay) return undefined; if (step >= trace.length) { setAutoplay(false); return undefined } const timer = window.setTimeout(() => setStep((current) => Math.min(current + 1, trace.length)), 650); return () => window.clearTimeout(timer) }, [autoplay, step, trace.length])
  const shuffle = () => { setValues(Array.from({ length: 7 }, () => Math.floor(Math.random() * 24) + 1)); setStep(0); setAutoplay(false) }
  return <GameCard topic="SORTING MASTER" title="How does this sort think?" intro="Choose a method and advance one comparison at a time. Watch the array change and keep an eye on the operation counts."><div className="game-controls"><label>Algorithm<select value={algorithm} onChange={(e) => { setAlgorithm(e.target.value); setStep(0); setAutoplay(false) }}><option>Bubble sort</option><option>Selection sort</option><option>Insertion sort</option><option>Merge sort</option></select></label><button className="secondary-button" onClick={shuffle}><RotateCcw size={13} /> Shuffle</button><button className="secondary-button" disabled={step >= trace.length} onClick={() => setAutoplay((value) => !value)}><Play size={13} /> {autoplay ? 'Pause' : 'Autoplay'}</button></div><div className="game-array">{frame.values.map((value, index) => <div className={`game-array-cell ${frame.pair.includes(index) ? 'is-focused' : ''}`} key={`${index}-${value}`} style={{ height: `${44 + value * 5}px` }}><strong>{value}</strong></div>)}</div><div className="game-stats"><span>Comparisons <strong>{frame.comparisons}</strong></span><span>Swaps <strong>{frame.swaps}</strong></span><button className="primary-button" disabled={step >= trace.length} onClick={() => setStep((current) => current + 1)}>{step >= trace.length ? 'Sorted' : 'Next comparison'} <ArrowRight size={14} /></button></div>{step >= trace.length && <div className="game-feedback"><Sparkles size={14} /> The array is in order. Try another algorithm and compare the work.</div>}</GameCard>
}
function SearchGame() {
  const values = [3, 7, 11, 16, 20, 25, 31, 38, 44]
  const [target, setTarget] = useState(25)
  const [low, setLow] = useState(0)
  const [high, setHigh] = useState(values.length - 1)
  const [guess, setGuess] = useState(null)
  const [won, setWon] = useState(false)
  const [guesses, setGuesses] = useState(0)
  const [message, setMessage] = useState('Choose where you think binary search should look next.')
  const mid = Math.floor((low + high) / 2)
  const optimalGuesses = Math.ceil(Math.log2(values.length + 1))
  const eliminated = (index) => index < low || index > high
  const check = () => {
    if (guess !== mid) { setMessage(`The middle index is ${mid}. Binary search checks the center of the remaining range.`); return }
    if (values[mid] === target) { setWon(true); setMessage(`Found ${target} at index ${mid} in ${guesses + 1} guesses. The worst case for this list is ${optimalGuesses}.`); setGuesses((count) => count + 1); return }
    if (values[mid] < target) { setLow(mid + 1); setMessage(`${values[mid]} is below ${target}, so discard indices ${low}–${mid}.`) }
    else { setHigh(mid - 1); setMessage(`${values[mid]} is above ${target}, so discard indices ${mid}–${high}.`) }
    setGuess(null); setGuesses((count) => count + 1)
  }
  const reset = () => { const next = values[Math.floor(Math.random() * values.length)]; setTarget(next); setLow(0); setHigh(values.length - 1); setGuess(null); setWon(false); setGuesses(0); setMessage('New target selected. Pick the midpoint of the live range.') }
  return <GameCard topic="BINARY SEARCH HUNTER" title="Hunt the hidden value" intro="The list is sorted. Choose the midpoint index of the active range, then use the comparison to eliminate half the candidates."><div className="target-banner">TARGET <strong>{won ? target : '???'}</strong><span>Guesses: {guesses} / {optimalGuesses} worst-case</span></div><div className="search-array">{values.map((value, index) => <button key={index} disabled={eliminated(index) || won} onClick={() => setGuess(index)} className={`search-cell ${eliminated(index) ? 'eliminated' : ''} ${index === mid && !won ? 'mid-cell' : ''} ${index === guess ? 'picked' : ''} ${won && index === mid ? 'found' : ''}`}><small>{index}</small><strong>{value}</strong>{index === low && <em>low</em>}{index === high && <em>high</em>}{index === mid && !won && <i>mid</i>}</button>)}</div><div className="game-feedback">{message}</div><div className="game-actions"><button className="primary-button" disabled={guess === null || won || low > high} onClick={check}>Check my guess <ArrowRight size={14} /></button><button className="secondary-button" onClick={reset}><RotateCcw size={13} /> New target</button></div></GameCard>
}
function StackGame() {
  const [items, setItems] = useState(['MAP', 'KEY'])
  const [value, setValue] = useState('NODE')
  const [message, setMessage] = useState('Last in, first out: the top item is the next one removed.')
  const capacity = 5
  const push = () => { if (!value.trim()) return; if (items.length >= capacity) { setMessage(`Capacity is ${capacity}. Pop an item before pushing another.`); return } setItems((current) => [...current, value.trim().toUpperCase()]); setMessage(`${value.trim().toUpperCase()} was pushed onto the top.`) }
  const pop = () => { if (!items.length) { setMessage('The stack is empty. There is nothing to pop.'); return } const top = items.at(-1); setItems((current) => current.slice(0, -1)); setMessage(`${top} was popped from the top. The item below it is now exposed.`) }
  return <GameCard topic="STACK ESCAPE" title="Use the top to escape" intro="A stack only lets you add or remove at its top. Push values, pop them back, and watch the last one in come out first."><div className="game-controls"><label>Value to push<input value={value} maxLength={8} onChange={(e) => setValue(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && push()} /></label><button className="primary-button" onClick={push}>Push <ArrowRight size={13} /></button><button className="secondary-button" onClick={pop}>Pop top</button><button className="secondary-button" onClick={() => setMessage(items.length ? `Peek sees ${items.at(-1)}. Nothing was removed.` : 'The stack is empty.')}>Peek</button></div><div className="stack-scene"><div className="stack-limit">CAPACITY {items.length}/{capacity}</div><div className="stack-vessel">{items.map((item, index) => <div className={`stack-block ${index === items.length - 1 ? 'stack-top' : ''}`} key={`${item}-${index}`}>{item}{index === items.length - 1 && <small>TOP</small>}</div>)}{!items.length && <span className="empty-state">Empty stack</span>}</div></div><div className="game-feedback">{message}</div><div className="game-hint"><LightbulbIcon /> Puzzle: push A, then B, then C. Which value must you pop first?</div></GameCard>
}
function QueueGame() {
  const capacity = 5
  const [queue, setQueue] = useState({ slots: ['MIRA', 'JON', null, null, null], front: 0, size: 2 })
  const [value, setValue] = useState('KAI')
  const [message, setMessage] = useState('First in, first out: serve the person who has waited longest.')
  const rear = (queue.front + queue.size - 1 + capacity) % capacity
  const logical = Array.from({ length: queue.size }, (_, offset) => queue.slots[(queue.front + offset) % capacity])
  const enqueue = () => { if (!value.trim()) return; if (queue.size === capacity) { setMessage(`The circular queue is full (${capacity}/${capacity}). Dequeue once to free a slot.`); return } const index = (queue.front + queue.size) % capacity; const next = [...queue.slots]; next[index] = value.trim().toUpperCase(); setQueue({ ...queue, slots: next, size: queue.size + 1 }); setMessage(`${value.trim().toUpperCase()} joined at index ${index}. The rear advances modulo ${capacity}.`) }
  const dequeue = () => { if (!queue.size) { setMessage('The queue is empty. There is nobody to serve.'); return } const first = queue.slots[queue.front]; const next = [...queue.slots]; next[queue.front] = null; const front = (queue.front + 1) % capacity; setQueue({ ...queue, slots: next, front, size: queue.size - 1 }); setMessage(`${first} left from index ${queue.front}. The front wraps around to index ${front}.`) }
  return <GameCard topic="QUEUE CHALLENGE" title="Keep the line moving" intro="Arrivals join at the rear. The person at the front leaves first. The circular buffer wraps indices so freed slots can be reused."><div className="game-controls"><label>New arrival<input value={value} maxLength={8} onChange={(e) => setValue(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && enqueue()} /></label><button className="primary-button" onClick={enqueue}>Enqueue <ArrowRight size={13} /></button><button className="secondary-button" onClick={dequeue}>Dequeue front</button><button className="secondary-button" onClick={() => setMessage(queue.size ? `The next person served is ${logical[0]}.` : 'The queue is empty.')}>Peek front</button></div><div className="ring-queue">{queue.slots.map((item, index) => <div className={`ring-slot ${item ? 'slot-filled' : ''} ${queue.size > 0 && index === queue.front ? 'slot-front' : ''} ${queue.size > 0 && index === rear ? 'slot-rear' : ''}`} key={index}><small>index {index}</small><strong>{item || 'empty'}</strong>{queue.size > 0 && index === queue.front && <em>FRONT</em>}{queue.size > 0 && index === rear && <i>REAR</i>}</div>)}</div><div className="game-feedback">{message}</div><div className="game-hint"><LightbulbIcon /> When rear reaches the last slot, the next enqueue wraps to index 0 if that slot is free.</div></GameCard>
}
function LinkedListGame() {
  const [nodes, setNodes] = useState([8, 14, 23])
  const [value, setValue] = useState('31')
  const [message, setMessage] = useState('Each arrow is a next pointer. Reversing a list changes the direction of every pointer.')
  const add = () => { const number = Number(value); if (!Number.isInteger(number) || !value) return; setNodes((current) => [...current, number]); setMessage(`Added node ${number} at the tail; the previous tail now points to it.`) }
  const remove = () => { if (!nodes.length) { setMessage('There are no nodes to remove.'); return } const deleted = nodes.at(-1); setNodes((current) => current.slice(0, -1)); setMessage(`Removed tail node ${deleted}. The new tail now points to None.`) }
  const reverse = () => { setNodes((current) => [...current].reverse()); setMessage('Reversed the next pointers. The old tail is now the head.') }
  return <GameCard topic="LINKED LIST BUILDER" title="Rewire the chain" intro="A linked list stores values in nodes. Each node points to the next one, so inserting or reversing means changing references."><div className="game-controls"><label>Node value<input type="number" value={value} onChange={(e) => setValue(e.target.value)} /></label><button className="primary-button" onClick={add}>Insert at tail <ArrowRight size={13} /></button><button className="secondary-button" onClick={remove}>Delete tail</button><button className="secondary-button" onClick={reverse}>Reverse links</button></div><div className="list-head">HEAD</div><div className="linked-chain">{nodes.map((node, index) => <div className="linked-pair" key={`${node}-${index}`}><div className="linked-node"><span>value</span><strong>{node}</strong><span>next →</span></div>{index < nodes.length - 1 && <ArrowRight className="linked-arrow" size={20} />}</div>)}{nodes.length > 0 && <div className="null-node">None</div>}{!nodes.length && <span className="empty-state">Empty list</span>}</div><div className="game-feedback">{message}</div></GameCard>
}
function TreeGame() {
  const [values, setValues] = useState([8, 4, 12, 2, 6, 10, 14])
  const [value, setValue] = useState('5')
  const [order, setOrder] = useState('')
  const [message, setMessage] = useState('Insert or remove a value to see how the search tree changes.')
  const root = useMemo(() => makeTree(values), [values])
  const add = () => { const number = Number(value); if (!Number.isInteger(number) || values.includes(number)) { setMessage('Enter a new whole number that is not already in the tree.'); return } setValues((current) => [...current, number]); setOrder(''); setMessage(`Inserted ${number} by comparing down from the root.`) }
  const remove = () => { const number = Number(value); if (!values.includes(number)) { setMessage(`${number} is not in this tree.`); return } setValues((current) => deleteTreeValue(current, number)); setOrder(''); setMessage(`Removed ${number}. Its child links were reconnected to preserve the search-tree order.`) }
  return <GameCard topic="TREE BUILDER" title="Plant a search tree" intro="Insert each number by comparing it with the current node: smaller values go left, larger values go right."><div className="game-controls"><label>Value<input type="number" value={value} onChange={(e) => setValue(e.target.value)} /></label><button className="primary-button" onClick={add}>Insert node <ArrowRight size={13} /></button><button className="secondary-button" onClick={remove}>Remove value</button><button className="secondary-button" onClick={() => { setValues([8, 4, 12, 2, 6, 10, 14]); setOrder(''); setMessage('Reset to a balanced example tree.') }}>Reset tree</button></div><div className="tree-visual"><TreeNode node={root} /></div><div className="game-actions">{['Preorder', 'Inorder', 'Postorder', 'BFS'].map((mode) => <button className="secondary-button" key={mode} onClick={() => setOrder(`${mode}: ${traverse(root, mode).join(' → ')}`)}>{mode}</button>)}</div><div className="game-feedback"><GitBranch size={14} />{order || message}{order.startsWith('Inorder:') && ' — sorted order confirms this is a binary search tree.'}</div></GameCard>
}
function makeTree(values) { let root = null; for (const value of values) { if (!root) { root = { value, left: null, right: null }; continue } let node = root; while (true) { const side = value < node.value ? 'left' : 'right'; if (!node[side]) { node[side] = { value, left: null, right: null }; break } node = node[side] } } return root }
function deleteTreeValue(values, target) { const root = makeTree(values); const remove = (node, value) => { if (!node) return null; if (value < node.value) node.left = remove(node.left, value); else if (value > node.value) node.right = remove(node.right, value); else { if (!node.left) return node.right; if (!node.right) return node.left; let successor = node.right; while (successor.left) successor = successor.left; node.value = successor.value; node.right = remove(node.right, successor.value) } return node }; const next = remove(root, target); const output = []; const visit = (node) => { if (!node) return; output.push(node.value); visit(node.left); visit(node.right) }; visit(next); return output }
function traverse(root, mode) { const result = []; if (mode === 'BFS') { const queue = root ? [root] : []; while (queue.length) { const node = queue.shift(); result.push(node.value); if (node.left) queue.push(node.left); if (node.right) queue.push(node.right) } return result } const walk = (node) => { if (!node) return; if (mode === 'Preorder') result.push(node.value); walk(node.left); if (mode === 'Inorder') result.push(node.value); walk(node.right); if (mode === 'Postorder') result.push(node.value) }; walk(root); return result }
function TreeNode({ node }) { if (!node) return null; return <div className="tree-node-wrap"><div className="tree-node">{node.value}</div>{(node.left || node.right) && <div className="tree-children"><div>{node.left ? <TreeNode node={node.left} /> : <span className="tree-null" />}</div><div>{node.right ? <TreeNode node={node.right} /> : <span className="tree-null" />}</div></div>}</div> }
function GraphGame() {
  const [graph, setGraph] = useState({ A: ['B', 'C'], B: ['A', 'D', 'E'], C: ['A', 'F'], D: ['B'], E: ['B', 'F'], F: ['C', 'E'] })
  const [mode, setMode] = useState('BFS')
  const [start, setStart] = useState('A')
  const [from, setFrom] = useState('A')
  const [to, setTo] = useState('D')
  const [visited, setVisited] = useState([])
  const [message, setMessage] = useState('Add a node or edge, then compare the traversal orders.')
  const [mazePath, setMazePath] = useState([])
  const walls = new Set(['1,1', '1,3', '2,3', '3,1', '3,2'])
  const nodes = Object.keys(graph)
  const positions = { A: [10, 12], B: [43, 5], C: [77, 13], D: [16, 65], E: [49, 60], F: [78, 69], G: [10, 41], H: [62, 36] }
  const addNode = () => { const next = 'ABCDEFGH'.split('').find((node) => !graph[node]); if (!next) { setMessage('This canvas supports up to eight nodes.'); return } setGraph((current) => ({ ...current, [next]: [] })); setStart(next); setFrom(next); setTo(nodes[0]); setVisited([]); setMessage(`Added node ${next}. It has no edges yet.`) }
  const addEdge = () => { if (!from || !to || from === to || graph[from].includes(to)) { setMessage('Choose two different nodes that are not already connected.'); return } setGraph((current) => ({ ...current, [from]: [...current[from], to], [to]: [...current[to], from] })); setVisited([]); setMessage(`Added an undirected edge between ${from} and ${to}.`) }
  const solveMaze = () => { const start = '0,0'; const goal = '4,4'; const queue = [start]; const previous = new Map([[start, null]]); while (queue.length) { const current = queue.shift(); if (current === goal) break; const [row, column] = current.split(',').map(Number); for (const [dr, dc] of [[-1, 0], [0, 1], [1, 0], [0, -1]]) { const nextRow = row + dr; const nextColumn = column + dc; const next = `${nextRow},${nextColumn}`; if (nextRow >= 0 && nextRow < 5 && nextColumn >= 0 && nextColumn < 5 && !walls.has(next) && !previous.has(next)) { previous.set(next, current); queue.push(next) } } } const path = []; let cell = goal; while (cell) { path.unshift(cell); cell = previous.get(cell) } setMazePath(path); setMessage(`Breadth-first search found a shortest route with ${path.length - 1} edges.`) }
  const run = () => { const order = []; const seen = new Set([start]); const pending = [start]; while (pending.length) { const node = mode === 'BFS' ? pending.shift() : pending.pop(); order.push(node); const neighbors = mode === 'DFS' ? [...graph[node]].reverse() : graph[node]; for (const neighbor of neighbors) if (!seen.has(neighbor)) { seen.add(neighbor); pending.push(neighbor) } } setVisited(order) }
  return <GameCard topic="GRAPH EXPLORER" title="Trace the network" intro="Start at one vertex and visit every reachable node. BFS uses a queue; DFS keeps following one path before backtracking."><div className="game-controls"><label>Start vertex<select value={start} onChange={(e) => { setStart(e.target.value); setVisited([]) }}>{nodes.map((node) => <option key={node}>{node}</option>)}</select></label><button className={`secondary-button ${mode === 'BFS' ? 'active-game-mode' : ''}`} onClick={() => { setMode('BFS'); setVisited([]) }}>BFS · queue</button><button className={`secondary-button ${mode === 'DFS' ? 'active-game-mode' : ''}`} onClick={() => { setMode('DFS'); setVisited([]) }}>DFS · stack</button><button className="primary-button" onClick={run}>Run {mode} <ArrowRight size={13} /></button></div><div className="game-controls graph-edit"><button className="secondary-button" onClick={addNode}>Add node</button><label>From<select value={from} onChange={(e) => setFrom(e.target.value)}>{nodes.map((node) => <option key={node}>{node}</option>)}</select></label><label>To<select value={to} onChange={(e) => setTo(e.target.value)}>{nodes.map((node) => <option key={node}>{node}</option>)}</select></label><button className="secondary-button" onClick={addEdge}>Add edge</button><span>{message}</span></div><div className="graph-map">{nodes.map((node) => { const [x, y] = positions[node]; return <div key={node} className={`graph-node ${visited.includes(node) ? 'graph-visited' : ''}`} style={{ left: `${x}%`, top: `${y}%` }}><strong>{node}</strong><small>{visited.includes(node) ? `#${visited.indexOf(node) + 1}` : '·'}</small><span>{graph[node].join(' · ') || 'no edges'}</span></div> })}<svg viewBox="0 0 560 220" aria-hidden="true">{nodes.flatMap((node) => graph[node].filter((neighbor) => node < neighbor).map((neighbor) => <line key={`${node}-${neighbor}`} x1={(positions[node][0] + 5) * 5.6} y1={(positions[node][1] + 12) * 2.2} x2={(positions[neighbor][0] + 5) * 5.6} y2={(positions[neighbor][1] + 12) * 2.2} />))}</svg></div>{visited.length > 0 && <div className="game-feedback"><Network size={14} />Visit order: {visited.join(' → ')}. {mode === 'BFS' ? 'Nodes are discovered layer by layer.' : 'The traversal follows a branch before it backtracks.'}</div>}<div className="maze-heading"><div><div className="panel-kicker">MAZE CHALLENGE · BREADTH FIRST SEARCH</div><p>Find a shortest route from the green start to the violet goal. Gray cells are blocked.</p></div><button className="secondary-button" onClick={solveMaze}>Solve maze with BFS <ArrowRight size={13} /></button></div><div className="maze-grid">{Array.from({ length: 5 }, (_, row) => Array.from({ length: 5 }, (_, column) => { const key = `${row},${column}`; const blocked = walls.has(key); return <div key={key} className={`maze-cell ${blocked ? 'maze-wall' : ''} ${key === '0,0' ? 'maze-start' : ''} ${key === '4,4' ? 'maze-goal' : ''} ${mazePath.includes(key) ? 'maze-path' : ''}`}>{key === '0,0' ? 'S' : key === '4,4' ? 'G' : blocked ? '' : mazePath.includes(key) ? '•' : ''}</div> }))}</div><div className="game-feedback"><Sparkles size={14} />{message}</div></GameCard>
}
function DPGame() {
  const [n, setN] = useState(8)
  const [mode, setMode] = useState('Memoization')
  const values = useMemo(() => { const table = [0, 1]; for (let index = 2; index <= n; index += 1) table[index] = table[index - 1] + table[index - 2]; return table.slice(0, n + 1) }, [n])
  const calls = mode === 'Memoization' ? n + 1 : 0
  return <GameCard topic="DP DUNGEON" title="Cache the path you solved" intro="Fibonacci repeats the same smaller questions. Memoization saves answers during recursion; tabulation fills them in order."><div className="game-controls"><label>Find Fibonacci<input type="number" min="2" max="12" value={n} onChange={(e) => setN(Math.min(12, Math.max(2, Number(e.target.value))))} /></label><button className={`secondary-button ${mode === 'Memoization' ? 'active-game-mode' : ''}`} onClick={() => setMode('Memoization')}>Memoization</button><button className={`secondary-button ${mode === 'Tabulation' ? 'active-game-mode' : ''}`} onClick={() => setMode('Tabulation')}>Tabulation</button></div><div className="dp-equation">F(n) = F(n − 1) + F(n − 2) <span>·</span> F(0)=0, F(1)=1</div><div className="dp-table">{values.map((value, index) => <div key={index} className={index === n ? 'dp-answer' : ''}><small>F({index})</small><strong>{value}</strong></div>)}</div><div className="game-stats"><span>Subproblems computed <strong>{n + 1}</strong></span><span>Recursive calls <strong>{calls}</strong></span></div><div className="game-feedback"><Sparkles size={14} />F({n}) = {values[n]}. Both methods reuse subproblem answers; tabulation avoids recursive call overhead.</div></GameCard>
}
function LightbulbIcon() { return <Sparkles size={14} /> }
