import { useState, useCallback } from 'react'
import { Play, Copy, Check, Loader2 } from 'lucide-react'

interface CodeBlockProps {
  language: string
  code: string
  noRun?: boolean
}

// Extract OUTPUT from end of code
// Format: code...\nOUTPUT: expected result
function extractOutput(code: string): { code: string; output: string | null } {
  const lines = code.split('\n')
  
  // Look for OUTPUT: at the end
  for (let i = lines.length - 1; i >= 0; i--) {
    const line = lines[i].trim()
    const match = line.match(/^OUTPUT:\s*(.*)$/s)
    if (match) {
      // Get all lines after OUTPUT: as the output
      const outputLines = [match[1]]
      // Include any lines that follow (for multi-line output)
      for (let j = i + 1; j < lines.length; j++) {
        outputLines.push(lines[j])
      }
      // Return code without the OUTPUT line(s)
      const codeOnly = lines.slice(0, i).join('\n')
      return { code: codeOnly, output: outputLines.join('\n').trim() || null }
    }
  }
  
  return { code, output: null }
}

export function CodeBlock({ language, code, noRun }: CodeBlockProps) {
  const [copied, setCopied] = useState(false)
  const [running, setRunning] = useState(false)
  const [output, setOutput] = useState<string | null>(null)
  
  // Extract output from code
  const { code: displayCode, output: presetOutput } = extractOutput(code)
  
  const handleCopy = useCallback(async () => {
    await navigator.clipboard.writeText(displayCode)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }, [displayCode])

  const handleRun = useCallback(() => {
    setRunning(true)
    setOutput(null)

    // Simulate a brief delay for UX
    setTimeout(() => {
      if (presetOutput) {
        setOutput(presetOutput)
      }
      setRunning(false)
    }, 300)
  }, [presetOutput])

  // Only show Run button if:
  // 1. noRun is not set
  // 2. There's an OUTPUT defined
  const showRun = !noRun && presetOutput !== null

  return (
    <div className="code-blk">
      <div className="code-hd">
        <span className="code-lang">{language}</span>
        <div className="code-actions">
          {showRun && (
            <button 
              className="code-btn code-btn-primary" 
              onClick={handleRun}
              disabled={running}
              aria-label={running ? 'Running' : 'Run'}
            >
              {running ? (
                <Loader2 size={14} className="spin" />
              ) : (
                <Play size={14} />
              )}
              <span>{running ? 'Running' : 'Run'}</span>
            </button>
          )}
          <button 
            className="code-btn code-btn-secondary" 
            onClick={handleCopy}
            aria-label={copied ? 'Copied!' : 'Copy code'}
          >
            {copied ? <Check size={14} /> : <Copy size={14} />}
            <span>{copied ? 'Copied' : 'Copy'}</span>
          </button>
        </div>
      </div>
      <pre>{displayCode}</pre>
      {output && (
        <div className="code-output">
          <div className="code-output-label">Output:</div>
          <pre>{output}</pre>
        </div>
      )}
    </div>
  )
}