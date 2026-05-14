import Link from "next/link";

export default function Footer() {
    return (
        <footer className="text-center py-8 text-sm flex flex-col justify-center items-center gap-4 justify-between w-full p-4">
            <p className="">
                <b>Github Repo: </b>
                <Link
                    href={"https://github.com/The-Rigid-Project/media-optimizer"}
                    target="_blank"
                    className="text-sky-500 hover:underline"
                >
                    The-Rigid-Project/media-optimizer
                </Link>
            </p>
        </footer>
    );
}