export function CouncilView() {
  return (
    <div className="view on">
      <div className="council-stage">
        <h1 className="vi-h">Council</h1>
        <p className="vi-sub">Ask multiple AI models at once</p>
        <div className="council-slots">
          <div className="c-slot">
            <span className="c-slot-icon">+</span>
            <span className="c-slot-name">Add Model</span>
          </div>
        </div>
        <div className="council-modes">
          <button className="c-mode on">Sequential</button>
          <button className="c-mode">Parallel</button>
          <button className="c-mode">Debate</button>
        </div>
      </div>
    </div>
  )
}