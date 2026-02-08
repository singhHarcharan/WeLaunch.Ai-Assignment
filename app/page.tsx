// "use client";

// import { ChatBot } from "@/components/chat-bot";
// import { Sidebar } from "@/components/sidebar";
// import { useApp } from "@/contexts/app-context";

// export default function Home() {
//   const { isSidebarCollapsed, toggleSidebar } = useApp();
//   const chatId = "default-chat"; // This would come from your routing or state management

//   return (
//     <div className="flex h-screen bg-background">
//       <Sidebar 
//         collapsed={isSidebarCollapsed} 
//         onToggle={toggleSidebar} 
//       />
//       <main className="flex-1 flex flex-col h-full overflow-hidden">
//         <ChatBot chatId={chatId} />
//       </main>
//     </div>
//   );
// }

export default function Home() {
  return <div>Home</div>;
}