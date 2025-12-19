import { useNavigate, useLocation } from "react-router-dom";
import { Home, BookOpen, Rss, MessageSquare, Bell, Settings } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface NavItem {
  icon: React.ElementType;
  path: string;
  badge?: number;
}

export const MobileBottomNav = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  const navItems: NavItem[] = [
    { icon: Home, path: "/dashboard" },
    { icon: BookOpen, path: "/matieres" },
    { icon: Rss, path: "/feed" },
    { icon: MessageSquare, path: "/community", badge: unreadMessages > 0 ? unreadMessages : undefined },
    { icon: Bell, path: "/notifications", badge: unreadNotifications > 0 ? unreadNotifications : undefined },
    { icon: Settings, path: "/settings" },
  ];

  const currentIndex = navItems.findIndex(item => item.path === location.pathname);

  useEffect(() => {
    fetchCounts();
    
    const messagesChannel = supabase
      .channel("mobile-nav-messages")
      .on("postgres_changes", { event: "*", schema: "public", table: "messages" }, fetchCounts)
      .subscribe();

    const notificationsChannel = supabase
      .channel("mobile-nav-notifications")
      .on("postgres_changes", { event: "*", schema: "public", table: "notifications" }, fetchCounts)
      .subscribe();

    return () => {
      supabase.removeChannel(messagesChannel);
      supabase.removeChannel(notificationsChannel);
    };
  }, []);

  const fetchCounts = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: messages } = await supabase
      .from("messages")
      .select("id")
      .eq("read", false)
      .neq("sender_id", user.id);
    
    const { count: notifCount } = await supabase
      .from("notifications")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id)
      .eq("read", false);

    setUnreadMessages(messages?.length || 0);
    setUnreadNotifications(notifCount || 0);
  };

  // Swipe detection
  const minSwipeDistance = 50;

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe && currentIndex < navItems.length - 1) {
      navigate(navItems[currentIndex + 1].path);
    }
    if (isRightSwipe && currentIndex > 0) {
      navigate(navItems[currentIndex - 1].path);
    }
  };

  const isActive = (path: string) => location.pathname === path;

  // Hide on certain pages
  const hiddenPaths = ["/auth", "/onboarding"];
  const isLessonPage = location.pathname.includes("-lesson/");
  
  if (hiddenPaths.includes(location.pathname) || isLessonPage) {
    return null;
  }

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-[1000] bg-card/95 backdrop-blur-lg border-t border-border md:hidden safe-bottom"
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      <div className="flex items-center justify-around h-14 px-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);
          
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`relative flex items-center justify-center flex-1 h-full transition-all duration-200 ${
                active 
                  ? "text-primary" 
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <div className="relative">
                <Icon 
                  size={24} 
                  strokeWidth={active ? 2.5 : 2}
                  className={`transition-transform duration-200 ${active ? "scale-110" : ""}`}
                />
                {item.badge && item.badge > 0 && (
                  <span className="absolute -top-1.5 -right-2 flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full bg-destructive text-destructive-foreground text-[10px] font-bold">
                    {item.badge > 99 ? "99+" : item.badge}
                  </span>
                )}
              </div>
              {active && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-primary rounded-full" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
