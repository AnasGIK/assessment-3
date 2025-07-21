import Link from "next/link";

const Home = () => {
  return (
    <div className="p-5">
      <Link href="/login" className="btn btn-primary">
        Login
      </Link>
      <Link href="/stores" className="btn btn-secondary ml-2">
        View Stores
      </Link>
      <Link href="/register-store" className="btn btn-accent ml-2">
        Register
      </Link>
      <Link href="/add-store" className="btn btn-accent ml-2">
        Add Store
      </Link>
      <Link href="/add-walkin-logs" className="btn btn-accent ml-2">
        Add Walk-in logs
      </Link>
    </div>
  );
};

export default Home;
