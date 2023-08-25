import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Layout, Menu, Spin, Button } from "antd";
import Home from "pages/Home/Home.lazy";
import Login from "pages/Login/Login.lazy";
import axios from "axios";
import { useCurrentUser, useEnsureCSRF, logout } from "services/auth_service";
const _App = () => {
  useEnsureCSRF();
  const { data: currentUser, status } = useCurrentUser();

  if (status === "loading") {
    return <Spin />;
  } else if (currentUser === undefined) {
    return <Login />;
  }

  return (
    <Layout style={{ width: "100%", height: "100%" }}>
      <Layout.Header
        style={{ display: "flex", alignItems: "center", paddingRight: "10px" }}
      >
        <Menu
          theme="dark"
          mode="horizontal"
          items={[
            { key: "home", label: "" },
            // { key: "users", label: "Users" },
          ]}
          style={{ width: "100%", height: "100%" }}
        />
        <Button
          type="text"
          style={{ color: "white" }}
          onClick={() => {
            logout();
          }}
        >
          Logout
        </Button>
      </Layout.Header>
      <Layout.Content
        style={{ padding: "5px 10px", height: "100%", width: "100%" }}
      >
        <Routes>
          , width: '100%' <Route path="*" element={<Home />} />
        </Routes>
      </Layout.Content>
    </Layout>
  );
};

const App = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 15000,
      },
    },
  });
  axios.defaults.baseURL = import.meta.env.VITE_API_URL_BASE;
  axios.defaults.withCredentials = true;
  axios.defaults.xsrfCookieName = "_csrf_token";
  axios.defaults.xsrfHeaderName = "X-CSRFToken";

  return (
    <Router>
      <QueryClientProvider client={queryClient}>
        <_App />
      </QueryClientProvider>
    </Router>
  );
};

export default App;
