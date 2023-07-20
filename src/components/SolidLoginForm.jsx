import { getDefaultSession, fetch } from "@inrupt/solid-client-authn-browser";
import {  getLiteral, getProfileAll, getThing } from "@inrupt/solid-client";
import { FOAF } from "@inrupt/vocab-common-rdf";
import { useState } from "react";

function SolidLoginForm() {
  const session = getDefaultSession();
  let webId = session.info.webId
  const [name, setName] = useState(undefined)
  if (webId) {
    getProfileAll(webId, { fetch: fetch }).then((dataSet) => {
      let profile = dataSet.webIdProfile
      const webIdThing = getThing(profile, webId)
      setName(getLiteral(webIdThing, FOAF.name).value) 
    });
  }

  function handleLogin(event) {
    event.preventDefault();

    let idp = event.target[0].value;
    session.login({
      oidcIssuer: idp,
      redirectUrl: new URL("/", window.location.href).toString(),
      clientName: "Generic Data Viewer",
    });
  }

  function handleLogout(event) {
    event.preventDefault();
    session.logout();
  }

  if (!session.info.isLoggedIn) {
    return (
      <form onSubmit={handleLogin}>
        <input type="text" placeholder="Identity Provider..." defaultValue="https://inrupt.net" />
        <input type="submit" value="Login" />
      </form>
    );
  } else {
    return (
      <>
        <label>
          <strong>Logged in as: </strong>
          {name }
        </label>
        <button onClick={handleLogout}>Logout</button>
      </>
    );
  }
}


export default SolidLoginForm