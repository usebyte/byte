import { useStore } from '../../store/useStore'

export function TokenBar() {
  const { selectedModelId, providers } = useStore()

  const model = providers
    .flatMap((p) => p.models)
    .find((m) => m.id === selectedModelId)

  if (!model) {
    return (
      <div className="tok-bar">
        <div className="tok-track">
          <div className="tok-fill" style={{ width: '0%' }} />
        </div>
        <div className="tok-labels">
          <span>No model selected</span>
          <span>0 tokens</span>
        </div>
      </div>
    )
  }

  return (
    <div className="tok-bar">
      <div className="tok-track">
        <div className="tok-fill" style={{ width: '0%' }} />
      </div>
      <div className="tok-labels">
        <span>{model.name}</span>
        <span>{model.contextWindow.toLocaleString()} context</span>
      </div>
    </div>
  )
}
