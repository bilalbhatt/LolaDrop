import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const NotFound = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to home page after a brief delay
    const timer = setTimeout(() => {
      navigate("/");
    }, 100);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted">
      <div className="text-center">
        <h1 className="mb-4 text-4xl font-bold">Redirecting...</h1>
        <p className="mb-4 text-xl text-muted-foreground">Taking you home</p>
      </div>
    </div>
  );
};

export default NotFound;
