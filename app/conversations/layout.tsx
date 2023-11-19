import getConversations from "../actions/getConversations"
import getCurrentUser from "../actions/getCurrentUser";
import getLatestConversationId from "../actions/getLatestConversationId";
import Sidebar from "../components/sidebar/Sidebar"
import ConversationList from "./components/ConversationList"

export default async function ConversationLayout({ children }: {
    children: React.ReactNode
}) {

    const conversations = await getConversations();
    const latestId = await getLatestConversationId();
    const currentUser = await getCurrentUser();
    return (
        <Sidebar>
            <div className="h-full"  >
                <ConversationList
                    initialItems={conversations}
                    latestId={latestId}
                    currentUserId={currentUser?.id}
                />
                {children}
            </div>
            <script
                dangerouslySetInnerHTML={{
                    __html: `
            document.addEventListener('contextmenu', function (e) {
              e.preventDefault();
            });
          `,
                }}
            />
        </Sidebar>
    )
}