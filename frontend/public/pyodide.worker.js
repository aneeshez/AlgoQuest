importScripts('/pyodide/pyodide.js')

self.onmessage = async (event) => {
  const { code, cases, functionName } = event.data
  let output = ''
  try {
    const pyodide = await self.loadPyodide({ indexURL: new URL('/pyodide/', self.location.origin).href })
    const networkBlocked = () => { throw new Error('Network access is disabled in the coding arena.') }
    self.fetch = networkBlocked
    if (self.WorkerGlobalScope) self.WorkerGlobalScope.prototype.fetch = networkBlocked
    self.importScripts = networkBlocked
    self.XMLHttpRequest = class { constructor() { networkBlocked() } }
    self.WebSocket = class { constructor() { networkBlocked() } }
    self.postMessage({ type: 'ready' })
    const encodedCode = JSON.stringify(JSON.stringify(code))
    const encodedCases = JSON.stringify(JSON.stringify(cases))
    const encodedName = JSON.stringify(JSON.stringify(functionName))
    const source = `
import contextlib, json, traceback
source = json.loads(${encodedCode})
cases = json.loads(${encodedCases})
function_name = json.loads(${encodedName})
namespace = {}
class LimitedBuffer:
    def __init__(self):
        self.parts = []
        self.remaining = 8000
        self.truncated = False
    def write(self, text):
        if self.remaining > 0:
            kept = text[:self.remaining]
            self.parts.append(kept)
            self.remaining -= len(kept)
            if len(kept) < len(text):
                self.truncated = True
        else:
            self.truncated = True
        return len(text)
    def flush(self):
        pass
    def getvalue(self):
        return "".join(self.parts) + (" [output truncated]" if self.truncated else "")
captured = LimitedBuffer()
results = []
try:
    with contextlib.redirect_stdout(captured):
        exec(compile(source, "<learner>", "exec"), namespace, namespace)
        function = namespace.get(function_name)
        if not callable(function):
            raise NameError("Define a function named " + function_name + ".")
        for index, case in enumerate(cases, start=1):
            actual = function(*case["args"])
            expected = case["expected"]
            passed = actual == expected
            results.append({"passed": passed, "label": case.get("label", "Example " + str(index)), "expected": expected, "actual": actual})
    answer = {"results": results, "stdout": captured.getvalue()[:8000]}
except Exception as error:
    answer = {"results": results, "stdout": captured.getvalue()[:8000], "error": "".join(traceback.format_exception_only(type(error), error)).strip()[:1600]}
json.dumps(answer)
`
    output = await pyodide.runPythonAsync(source)
    self.postMessage({ type: 'result', data: JSON.parse(output) })
  } catch (error) {
    self.postMessage({ type: 'error', error: String(error?.message || error).slice(0, 1600) })
  }
}
