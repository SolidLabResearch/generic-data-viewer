import { getDefaultSession, fetch } from "@inrupt/solid-client-authn-browser";
import { getPodUrlAll } from "@inrupt/solid-client";
import { useState } from "react";

function SolidLoginForm() {
  const session = getDefaultSession();
  const webId = useState(session.info.webId);

  if (webId) {
    getPodUrlAll(webId, { fetch: fetch }).then((dataSet) => {
      console.log(dataSet);
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
        <input type="text" placeholder="Identity Provider..." />
        <input type="submit" value="Login" />
      </form>
    );
  } else {
    return (
      <>
        <label>
          <strong>Logged in as: </strong>
          {webId}
        </label>
        <button onClick={handleLogout}>Logout</button>
      </>
    );
  }
}


export default SolidLoginForm