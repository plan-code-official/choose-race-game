import sys

# Patch TSX
tsx_path = "src/ResultsPanel/ResultsPanel.tsx"
with open(tsx_path, "r") as f:
    tsx_data = f.read()

old_buttons = """          <button className="results-action" type="button" onClick={onBack}>
            <img className="results-action__bg" src={buttonFrame} alt="" aria-hidden="true" />
            <div className="results-action__group">
              <span className="results-action__text">اخرج</span>
              <img src={exitIcon} className="results-action__icon" alt="Exit" />
            </div>
          </button>

          <button className="results-action results-action--retry" type="button" onClick={onRetry}>
            <img className="results-action__bg" src={buttonFrame} alt="" aria-hidden="true" />
            <div className="results-action__group">
              <img src={retryIcon} className="results-action__icon" alt="Retry" />
              <span className="results-action__text" style={{ color: '#84ebff' }}>ثانِيَةً</span>
            </div>
          </button>"""

new_buttons = """          <button className="results-action results-action--retry" type="button" onClick={onRetry}>
            <img className="results-action__bg" src={buttonFrame} alt="" aria-hidden="true" />
            <div className="results-action__group">
              <span className="results-action__text" style={{ color: '#84ebff' }}>ثانِيَةً</span>
              <img src={retryIcon} className="results-action__icon" alt="Retry" />
            </div>
          </button>

          <button className="results-action" type="button" onClick={onBack}>
            <img className="results-action__bg" src={buttonFrame} alt="" aria-hidden="true" />
            <div className="results-action__group">
              <span className="results-action__text">اخرج</span>
              <img src={exitIcon} className="results-action__icon" alt="Exit" />
            </div>
          </button>"""

tsx_data = tsx_data.replace(old_buttons, new_buttons)
with open(tsx_path, "w") as f:
    f.write(tsx_data)
print("TSX updated.")


# Patch CSS
css_path = "src/ResultsPanel/ResultsPanelNative.css"
with open(css_path, "r") as f:
    css_data = f.read()

css_data = css_data.replace(
    ".results-stat-card--coins img { height: 90%; max-width: 96%; }",
    ".results-stat-card--coins img { height: 42%; max-height: 55px; }"
)

css_data = css_data.replace(
    "font-size: clamp(1.75rem, 4.4vw, 3.65rem);",
    "font-size: clamp(0.9rem, 4.4vw, 3.65rem);"
)

css_data = css_data.replace(
    "font-size: clamp(1rem, 2.7vw, 2.1rem);",
    "font-size: clamp(0.7rem, 2.7vw, 2.1rem);"
)

with open(css_path, "w") as f:
    f.write(css_data)
print("CSS updated.")

