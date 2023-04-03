import { component$, Slot, useTask$, useVisibleTask$ } from "@builder.io/qwik";
import {
  routeAction$,
  routeLoader$,
  useLocation,
  useNavigate,
} from "@builder.io/qwik-city";

import Header from "~/components/starter/header/header";
import Footer from "~/components/starter/footer/footer";

export const useServerTimeLoader = routeLoader$(() => {
  return {
    date: new Date().toISOString(),
  };
});

export const useGetCookieIdToken = routeLoader$(({ cookie }) => {
  return cookie.get("__ID_TOKEN__")?.value ?? "";
});

export const useGetCookieAccessToken = routeLoader$(({ cookie }) => {
  return cookie.get("__ACCESS_TOKEN__")?.value ?? "";
});

export const useGenerateAccessToken = routeAction$(
  async ({ token: idToken }, { cookie }) => {
    if (idToken) {
      // This mocks the calling of an external backend.
      const accessToken = await fetch("http://localhost:4173/auth", {
        method: "POST",
        headers: {
          accept: "application/json",
          "content-type": "application/json",
        },
        body: JSON.stringify({ token: idToken }),
      })
        .then<{ token: string }>((response) => response.json())
        .then(({ token }) => token);

      cookie.set("__ACCESS_TOKEN__", accessToken, { maxAge: [14, "days"] });
      cookie.set("__ID_TOKEN__", accessToken, { maxAge: [1, "hours"] });

      return { token: accessToken };
    }
  }
);

export default component$(() => {
  const idToken = useGetCookieIdToken();
  const accessToken = useGetCookieAccessToken();
  const generateAccessToken = useGenerateAccessToken();
  const navigate = useNavigate();
  const location = useLocation();

  useTask$(async ({ track }) => {
    track(() => idToken.value);

    if (idToken.value && !accessToken.value) {
      void generateAccessToken
        .submit({
          token: idToken,
        })
        .then(() => navigate("/demo/flower"));
    }
  });

  useVisibleTask$(({ track }) => {
    track(() => accessToken.value);

    if (accessToken.value) {
      void navigate(
        location.url.pathname === "/" ? "/demo/flower" : location.url.pathname
      );
    }
  });

  // Should be irrelevant
  return (
    <div class="page">
      <main>
        <Header />
        <Slot />
      </main>
      <div class="section dark">
        <div class="container">
          <Footer />
        </div>
      </div>
    </div>
  );
});
