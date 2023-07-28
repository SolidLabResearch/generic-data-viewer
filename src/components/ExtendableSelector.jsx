import { useState } from "react";

// Arrow
//https://stackoverflow.com/questions/30530946/collapse-arrow-on-mouse-click

/**
 * @param {String} props.extendContent the content shown when the component is extended.
 * @returns A component with a title, which can be extended by clicking a button. If extended extra content is shown.
 */
function ExtendableSelector({ extendContent, children }) {
  const [extended, setExtended] = useState(false);
  let switchExtended = () =>
    setExtended((old) => {
      return !old;
    });
  return (
    <>
      <li className="query-entry">
        <div className="extend-container">
          {children}
          <div
            role="button"
            onClick={(e) => {
              switchExtended();
              e.target.classList.toggle("down");
            }}
            className="arrow"
          />
        </div>
        {extended && <p data-testid="extended-content" className="extended-content">{extendContent}</p>}
      </li>
    </>
  );
}

export default ExtendableSelector;
