import { getDefaultSession, fetch } from "@inrupt/solid-client-authn-browser";
import { getLiteral, getProfileAll, getThing } from "@inrupt/solid-client";
import { FOAF } from "@inrupt/vocab-common-rdf";
import { useState } from "react";

function SolidLoginForm(props) {
  const session = getDefaultSession();
  let webId = session.info.webId;
  const [name, setName] = useState(undefined);
  if (webId) {
    getProfileAll(webId, { fetch: fetch }).then((dataSet) => {
      let profile = dataSet.webIdProfile;
      const webIdThing = getThing(profile, webId);
      let literalName = getLiteral(webIdThing, FOAF.name);
      if (literalName) {
        setName(literalName.value);
      } else {
        setName(webId);
      }
    }).catch(_ => setName(webId));
  }

  /**
   * Handling what should happen when the user trying to log in.
   * @param {Event} event the event calling the EventListener
   */
  function handleLogin(event) {
    event.preventDefault();
    props.onClick();
    let idp = event.target[0].value;
    session.login({
      oidcIssuer: idp,
      redirectUrl: new URL("/", window.location.href).toString(),
      clientName: "Generic Data Viewer",
    });
  }

  /**
   * Handling what should happen whe the user logs out.
   * @param {Event} event the event calling the EventListener
   */
  function handleLogout(event) {
    event.preventDefault();
    props.onClick();
    session.logout();
  }

  if (!session.info.isLoggedIn) {
    return (
      <div className="login-form">
        <form onSubmit={handleLogin}>
          <label id="idp-label" for="idp">IDP: </label>
          <input
            name="idp"
            type="text"
            placeholder="Identity Provider..."
            defaultValue="https://pod.playground.solidlab.be/"
          />
          <input type="submit" value="Login" className="form-button" />
        </form>
      </div>
    );
  } else {
    return (
      <div className="login-form">
        <label id="logged-in-label">
          <strong>Logged in as: </strong>
          {name}
        </label>
        <button className="form-button" onClick={handleLogout}>
          Logout
        </button>
      </div>
    );
  }
}

export default SolidLoginForm;
