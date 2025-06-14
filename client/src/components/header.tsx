import { useState } from "react";
import { Link } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu, Network, User, Settings, LogOut } from "lucide-react";

export default function Header() {
  const { user, isAuthenticated } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navigation = [
    { name: "Каталог", href: "#products" },
    { name: "Калькулятор", href: "#calculator" },
    { name: "Отзывы", href: "#reviews" },
    { name: "Контакты", href: "#contact" },
  ];

  return (
    <nav className="fixed top-0 w-full bg-white/95 backdrop-blur-sm shadow-lg z-50 transition-all duration-300">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-3">
            <Network className="h-8 w-8 text-forest-dark" />
            <span className="font-display font-bold text-xl text-forest-dark">ЛесПром</span>
          </Link>
          
          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-8">
            {navigation.map((item) => (
              <a
                key={item.name}
                href={item.href}
                className="text-gray-700 hover:text-forest-dark transition-colors"
              >
                {item.name}
              </a>
            ))}
            
            {/* User Menu */}
            <div className="flex items-center space-x-3">
              {isAuthenticated ? (
                <>
                  {user?.isAdmin && (
                    <Link href="/admin">
                      <Button variant="outline" size="sm">
                        <Settings className="h-4 w-4 mr-2" />
                        Админ
                      </Button>
                    </Link>
                  )}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={user?.profileImageUrl} />
                          <AvatarFallback>
                            {user?.firstName?.[0] || user?.email?.[0] || 'U'}
                          </AvatarFallback>
                        </Avatar>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-56" align="end">
                      <DropdownMenuItem className="flex-col items-start">
                        <div className="font-medium">{user?.firstName || 'Пользователь'}</div>
                        <div className="text-sm text-muted-foreground">{user?.email}</div>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => window.location.href = '/api/logout'}>
                        <LogOut className="mr-2 h-4 w-4" />
                        Выйти
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </>
              ) : (
                <div className="flex items-center space-x-3">
                  <Button 
                    variant="ghost" 
                    onClick={() => window.location.href = '/api/login'}
                  >
                    <User className="h-4 w-4 mr-2" />
                    Войти
                  </Button>
                  <Button 
                    className="bg-forest-dark hover:bg-forest-light text-white"
                    onClick={() => window.location.href = '/api/login'}
                  >
                    Регистрация
                  </Button>
                </div>
              )}
            </div>
          </div>
          
          {/* Mobile Menu Button */}
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-80">
              <div className="flex flex-col space-y-4 mt-6">
                {navigation.map((item) => (
                  <a
                    key={item.name}
                    href={item.href}
                    className="block text-gray-700 hover:text-forest-dark py-2"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {item.name}
                  </a>
                ))}
                
                <div className="border-t pt-4">
                  {isAuthenticated ? (
                    <div className="space-y-4">
                      <div className="flex items-center space-x-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={user?.profileImageUrl} />
                          <AvatarFallback>
                            {user?.firstName?.[0] || user?.email?.[0] || 'U'}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">{user?.firstName || 'Пользователь'}</div>
                          <div className="text-sm text-muted-foreground">{user?.email}</div>
                        </div>
                      </div>
                      {user?.isAdmin && (
                        <Link href="/admin">
                          <Button variant="outline" className="w-full">
                            <Settings className="h-4 w-4 mr-2" />
                            Админ панель
                          </Button>
                        </Link>
                      )}
                      <Button 
                        variant="outline" 
                        className="w-full"
                        onClick={() => window.location.href = '/api/logout'}
                      >
                        <LogOut className="h-4 w-4 mr-2" />
                        Выйти
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <Button 
                        variant="ghost" 
                        className="w-full"
                        onClick={() => window.location.href = '/api/login'}
                      >
                        <User className="h-4 w-4 mr-2" />
                        Войти
                      </Button>
                      <Button 
                        className="w-full bg-forest-dark hover:bg-forest-light text-white"
                        onClick={() => window.location.href = '/api/login'}
                      >
                        Регистрация
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  );
}
