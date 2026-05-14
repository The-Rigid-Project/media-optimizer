import MediaForm from "./components/media-form";
import Footer from "./components/footer";

export default function Home() {
  return (
    <div className="flex flex-col h-screen">
      <MediaForm />
      <Footer />
    </div>
  );
}
