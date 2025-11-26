import { Header, Footer } from "../components";
import { Outlet } from "react-router-dom";

const PublicLayout = () => {
  return (
    <>
      <Header />
      <main className="pt-16">
        <Outlet />{" "}
        {/* This is where your nested routes (Home, About, etc.) show up */}
      </main>
      <Footer />
    </>
  );
};

export default PublicLayout;
