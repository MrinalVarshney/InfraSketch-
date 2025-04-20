
import { getServerSession } from "next-auth";
import { NEXT_AUTH_OPTIONS } from "@/app/api/lib/auth";
import Appbar from "@/app/components/Appbar";

export default async function () {
    const session = await getServerSession(NEXT_AUTH_OPTIONS);
    return (
        <div>
        <Appbar/>
        <h1>Checkmate and Chill</h1>
        <h1>User Page</h1>
        {JSON.stringify(session)}
        {/* Add your user-specific content here */}
        </div>
    );
    }

