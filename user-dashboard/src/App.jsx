import React, { lazy as reactLazy, Suspense, useEffect, useRef, useState } from "react";
import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { logOut } from "@/store/authSlice";
import axiosInstance from "@/services/axios";
import ErrorBoundary from "@/components/ErrorBoundary";

// Wrap every lazy-loaded route in an ErrorBoundary so a failed dynamic
// import (e.g. a stale hashed chunk after a new deploy) shows a friendly
// "reload" screen instead of crashing the whole app to a blank page.
const withErrorBoundary = (WrappedComponent) => {
  const Wrapped = (props) => (
    <ErrorBoundary>
      <WrappedComponent {...props} />
    </ErrorBoundary>
  );
  Wrapped.displayName = `withErrorBoundary(${
    WrappedComponent.displayName || WrappedComponent.name || "Component"
  })`;
  return Wrapped;
};

// Shadow the default `lazy` so every existing lazy() call is wrapped.
const lazy = (loader) => withErrorBoundary(reactLazy(loader));

// home pages  & dashboard
//import Dashboard from "./pages/dashboard";
const Dashboard = lazy(() => import("./pages/dashboard"));

const BankingPage = lazy(() => import("./pages/dashboard/banking"));
const DepositPage = lazy(() => import("./pages/dashboard/deposit"));
const WithdrawPage = lazy(() => import("./pages/dashboard/withdraw"));

const Login = lazy(() => import("./pages/auth/login"));

const Register = lazy(() => import("./pages/auth/register"));

const VerifyEmail = lazy(() => import("./pages/auth/verify-email"));

const ForgotPass = lazy(() => import("./pages/auth/forgot-password"));

const LockScreen = lazy(() => import("./pages/auth/lock-screen"));

const Logout = lazy(() => import("./pages/auth/logout"));

const Error = lazy(() => import("./pages/404"));

import Layout from "./layout/Layout";
import AuthLayout from "./layout/AuthLayout";

// components pages
const Button = lazy(() => import("./pages/components/button"));
const Dropdown = lazy(() => import("./pages/components/dropdown"));
const Badges = lazy(() => import("./pages/components/badges"));
const Colors = lazy(() => import("./pages/components/colors"));
const Typography = lazy(() => import("./pages/components/typography"));
const Alert = lazy(() => import("./pages/components/alert"));
const Progressbar = lazy(() => import("./pages/components/progress-bar"));
const Card = lazy(() => import("./pages/components/card"));
const Image = lazy(() => import("./pages/components/image"));
const Placeholder = lazy(() => import("./pages/components/placeholder"));
const Tooltip = lazy(() => import("./pages/components/tooltip-popover"));
const Modal = lazy(() => import("./pages/components/modal"));
const Carousel = lazy(() => import("./pages/components/carousel"));
const Pagination = lazy(() => import("./pages/components/pagination"));
const TabsAc = lazy(() => import("./pages/components/tab-accordion"));
const Video = lazy(() => import("./pages/components/video"));

// forms components
const InputPage = lazy(() => import("./pages/forms/input"));
const TextareaPage = lazy(() => import("./pages/forms/textarea"));
const CheckboxPage = lazy(() => import("./pages/forms/checkbox"));
const RadioPage = lazy(() => import("./pages/forms/radio-button"));
const SwitchPage = lazy(() => import("./pages/forms/switch"));
const InputGroupPage = lazy(() => import("./pages/forms/input-group"));
const InputlayoutPage = lazy(() => import("./pages/forms/input-layout"));
const InputMask = lazy(() => import("./pages/forms/input-mask"));
const FormValidation = lazy(() => import("./pages/forms/form-validation"));
const FileInput = lazy(() => import("./pages/forms/file-input"));
const FormRepeater = lazy(() => import("./pages/forms/form-repeater"));
const FormWizard = lazy(() => import("./pages/forms/form-wizard"));
const SelectPage = lazy(() => import("./pages/forms/select"));
const Flatpicker = lazy(() => import("./pages/forms/date-time-picker"));

// chart page
const AppexChartPage = lazy(() => import("./pages/chart/appex-chart"));
const ChartJs = lazy(() => import("./pages/chart/chartjs"));
const Recharts = lazy(() => import("./pages/chart/recharts"));

// map page
const MapPage = lazy(() => import("./pages/map"));

// table pages
const BasicTablePage = lazy(() => import("./pages/table/table-basic"));
const TanstackTable = lazy(() => import("./pages/table/react-table"));

// utility pages
const InvoicePage = lazy(() => import("./pages/utility/invoice"));

const PricingPage = lazy(() => import("./pages/utility/pricing"));
const BlankPage = lazy(() => import("./pages/utility/blank-page"));
const ComingSoonPage = lazy(() => import("./pages/utility/coming-soon"));
const UnderConstructionPage = lazy(() =>
  import("./pages/utility/under-construction")
);



const Profile = lazy(() => import("./pages/utility/profile"));
const IconPage = lazy(() => import("./pages/icons"));
const NotificationPage = lazy(() => import("./pages/utility/notifications"));
const ChangelogPage = lazy(() => import("./pages/changelog"));

// widget pages
const BasicWidget = lazy(() => import("./pages/widget/basic-widget"));
const StatisticWidget = lazy(() => import("./pages/widget/statistic-widget"));

// app page


const ChatComingSoon = lazy(() => import("./pages/utility/chat-coming-soon"));





const EcommercePage = lazy(() => import("./pages/ecommerce"));

import Loading from "@/components/Loading";
import { ProductDetails } from "./pages/ecommerce/productDetails";
import Cart from "./pages/ecommerce/cart";
import Wishlist from "./pages/ecommerce/wish-list";
import Orders from "./pages/ecommerce/orders";
import OrderDetails from "./pages/ecommerce/orderDetails";
import Checkout from "./pages/ecommerce/checkout";
import EditProduct from "./pages/ecommerce/edit-product";
import Customers from "./pages/ecommerce/customers";
import Sellers from "./pages/ecommerce/sellers";
import AddProduct from "./pages/ecommerce/add-product";

function App() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const isAuth = useSelector((state) => state.auth.isAuth);
  const [authReady, setAuthReady] = useState(false);
  const bootCheckRef = useRef(false);

  // Single, deterministic session validation at app boot. If a token exists we
  // verify it once with the backend BEFORE rendering the routes. This replaces
  // the old behaviour where a burst of parallel requests on reload could each
  // trip the global 401 handler and wipe the session.
  useEffect(() => {
    if (bootCheckRef.current) return;
    bootCheckRef.current = true;

    const token = localStorage.getItem("token");
    if (!token) {
      setAuthReady(true);
      return;
    }

    // If the page was already authenticated during this SPA session, skip the
    // round-trip entirely — only cold reloads (fresh boot) need validation.
    if (isAuth) {
      setAuthReady(true);
      return;
    }

    axiosInstance
      .get("/user")
      .then((res) => {
        const user = res.data?.user || res.data;
        if (user) {
          localStorage.setItem("user", JSON.stringify(user));
        }
        setAuthReady(true);
      })
      .catch((err) => {
        // A 401 here means the token is genuinely invalid/expired. The axios
        // interceptor already dispatched "auth:unauthorized"; still clear local
        // state so we don't show the dashboard behind a dead session.
        if (err.response?.status === 401) {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          dispatch(logOut());
        }
        // Any other error (network, CORS, server down) must NOT log the user
        // out — keep them signed in and let the app render.
        setAuthReady(true);
      });
  }, [dispatch, isAuth]);

  // Global 401 listener: dispatched by the axios interceptor whenever an
  // authenticated request receives a genuine session-expiry 401. We clear auth
  // state and redirect via React Router (no full-page reload, respects base path).
  useEffect(() => {
    const handleUnauthorized = () => {
      dispatch(logOut());
      navigate("/", { replace: true });
    };
    window.addEventListener("auth:unauthorized", handleUnauthorized);
    return () => window.removeEventListener("auth:unauthorized", handleUnauthorized);
  }, [dispatch, navigate]);

  if (!authReady) {
    return (
      <main className="App relative">
        <Suspense fallback={<Loading />}>
          <Loading />
        </Suspense>
      </main>
    );
  }

  return (
    <main className="App  relative">
      <Routes>
        <Route path="/" element={<AuthLayout />}>
          <Route path="/" element={<Login />} />

<Route path="/register" element={<Register />} />

          <Route path="/verify-email" element={<VerifyEmail />} />

          <Route path="/forgot-password" element={<ForgotPass />} />
       
          <Route path="/lock-screen" element={<LockScreen />} />
    
        </Route>
        <Route path="/*" element={<Layout />}>
          <Route path="logout" element={<Logout />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="crm" element={<CrmPage />} />
<Route path="banking" element={<BankingPage />} />
          <Route path="deposit" element={<DepositPage />} />
          <Route path="withdraw" element={<WithdrawPage />} />
          {/* App pages */}
          <Route path="chat" element={<ChatComingSoon />} />
        
          {/* Components pages */}
          <Route path="button" element={<Button />} />
          <Route path="dropdown" element={<Dropdown />} />
          <Route path="badges" element={<Badges />} />
          <Route path="colors" element={<Colors />} />
          <Route path="typography" element={<Typography />} />
          <Route path="alert" element={<Alert />} />
          <Route path="progress-bar" element={<Progressbar />} />
          <Route path="card" element={<Card />} />
          <Route path="image" element={<Image />} />
          <Route path="Placeholder" element={<Placeholder />} />
          <Route path="tooltip-popover" element={<Tooltip />} />
          <Route path="modal" element={<Modal />} />
          <Route path="carousel" element={<Carousel />} />
          <Route path="Paginations" element={<Pagination />} />
          <Route path="tab-accordion" element={<TabsAc />} />
          <Route path="video" element={<Video />} />
          <Route path="input" element={<InputPage />} />
          <Route path="textarea" element={<TextareaPage />} />
          <Route path="checkbox" element={<CheckboxPage />} />
          <Route path="radio-button" element={<RadioPage />} />
          <Route path="switch" element={<SwitchPage />} />
          <Route path="input-group" element={<InputGroupPage />} />
          <Route path="input-layout" element={<InputlayoutPage />} />
          <Route path="input-mask" element={<InputMask />} />
          <Route path="form-validation" element={<FormValidation />} />
          <Route path="file-input" element={<FileInput />} />
          <Route path="form-repeater" element={<FormRepeater />} />
          <Route path="form-wizard" element={<FormWizard />} />
          <Route path="select" element={<SelectPage />} />
          <Route path="date-time-picker" element={<Flatpicker />} />
          <Route path="appex-chart" element={<AppexChartPage />} />
          <Route path="chartjs" element={<ChartJs />} />
          <Route path="recharts" element={<Recharts />} />
          <Route path="map" element={<MapPage />} />
          <Route path="table-basic" element={<BasicTablePage />} />
          <Route path="react-table" element={<TanstackTable />} />
          <Route path="invoice" element={<InvoicePage />} />

          <Route path="pricing" element={<PricingPage />} />
          <Route path="blank-page" element={<BlankPage />} />

 
  
          <Route path="profile" element={<Profile />} />
          <Route path="basic" element={<BasicWidget />} />
          <Route path="statistic" element={<StatisticWidget />} />
          <Route path="icons" element={<IconPage />} />
          <Route path="notifications" element={<NotificationPage />} />
          <Route path="changelog" element={<ChangelogPage />} />

          <Route path="products" element={<EcommercePage />} />
          <Route path="products/:id" element={<ProductDetails />} />
          <Route path="cart" element={<Cart />} />
          <Route path="wishlist" element={<Wishlist />} />
          <Route path="orders" element={<Orders />} />
          <Route path="order-details" element={<OrderDetails />} />
          <Route path="checkout" element={<Checkout />} />
          <Route path="add-product" element={<AddProduct />} />
          <Route path="edit-product" element={<EditProduct />} />
          <Route path="customers" element={<Customers />} />
          <Route path="sellers" element={<Sellers />} />

          <Route path="*" element={<Navigate to="/404" />} />
        </Route>
        <Route
          path="/404"
          element={
            <Suspense fallback={<Loading />}>
              <Error />
            </Suspense>
          }
        />
        <Route
          path="/coming-soon"
          element={
            <Suspense fallback={<Loading />}>
              <ComingSoonPage />
            </Suspense>
          }
        />
        <Route
          path="/under-construction"
          element={
            <Suspense fallback={<Loading />}>
              <UnderConstructionPage />
            </Suspense>
          }
        />
      </Routes>
    </main>
  );
}

export default App;
