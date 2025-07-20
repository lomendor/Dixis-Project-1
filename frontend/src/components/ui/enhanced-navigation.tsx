'use client';

import * as React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { HeaderCartIcon } from "@/components/cart/ModernCartIcon";
import { useEnhancedCategoriesTree } from "@/lib/api/services/category/useCategoriesEnhanced";
import { useAuthUser, useAuthStatus, useAuthActions } from "@/stores/authStore";
import {
  Menu,
  Search,
  User,
  LogOut,
  Settings,
  Package,
  Heart,
  ShoppingBag,
  TrendingUp,
  Sparkles,
  Star,
} from "lucide-react";

interface CategoryWithChildren {
  id: number;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  image?: string;
  product_count?: number;
  children?: CategoryWithChildren[];
}

interface ListItemProps extends Omit<React.ComponentPropsWithoutRef<"a">, "title"> {
  title?: React.ReactNode;
  className?: string;
  children?: React.ReactNode;
}

const ListItem = React.forwardRef<
  React.ElementRef<"a">,
  ListItemProps
>(({ className, title, children, ...props }, ref) => {
  return (
    <li>
      <NavigationMenuLink asChild>
        <a
          ref={ref}
          className={cn(
            "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
            className
          )}
          {...props}
        >
          <div className="text-sm font-medium leading-none">{title}</div>
          <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
            {children}
          </p>
        </a>
      </NavigationMenuLink>
    </li>
  )
});
ListItem.displayName = "ListItem";

interface EnhancedNavigationProps {
  className?: string;
}

export function EnhancedNavigation({ className }: EnhancedNavigationProps) {
  const { categories, isLoading } = useEnhancedCategoriesTree();
  const user = useAuthUser();
  const { isAuthenticated } = useAuthStatus();
  const { logout } = useAuthActions();

  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [searchOpen, setSearchOpen] = React.useState(false);

  // Get featured categories for mega menu
  const featuredCategories = React.useMemo(() => {
    if (!categories) return [];
    return categories.filter(cat => cat.product_count && cat.product_count > 0).slice(0, 8);
  }, [categories]);

  // Quick actions menu items
  const quickActions = [
    { name: "Προτεινόμενα", href: "/products?featured=true", icon: Star },
    { name: "Νέα Προϊόντα", href: "/products?sort=newest", icon: Sparkles },
    { name: "Δημοφιλή", href: "/products?sort=popular", icon: TrendingUp },
  ];

  const renderCategoryMegaMenu = () => {
    if (isLoading) {
      return (
        <div className="grid gap-3 p-6 md:grid-cols-3 lg:w-[600px]">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-muted rounded w-1/2"></div>
            </div>
          ))}
        </div>
      );
    }

    return (
      <div className="grid gap-3 p-6 md:grid-cols-3 lg:w-[700px]">
        {featuredCategories.map((category) => (
          <ListItem
            key={category.id}
            title={
              <div className="flex items-center gap-2">
                <span className="text-lg">{category.icon || '📦'}</span>
                <span>{category.name}</span>
                {category.product_count && category.product_count > 0 && (
                  <Badge variant="secondary" className="text-xs">
                    {category.product_count}
                  </Badge>
                )}
              </div>
            }
            href={`/products?category=${category.slug}`}
          >
            {category.description || `Ανακαλύψτε ${category.name.toLowerCase()}`}
          </ListItem>
        ))}
        
        {/* View All Categories */}
        <ListItem
          title={
            <div className="flex items-center gap-2">
              <Package className="h-4 w-4" />
              <span>Όλες οι Κατηγορίες</span>
            </div>
          }
          href="/categories"
          className="md:col-span-3 bg-muted/50"
        >
          Εξερευνήστε όλες τις κατηγορίες προϊόντων
        </ListItem>
      </div>
    );
  };

  const renderUserMenu = () => {
    if (!isAuthenticated || !user) {
      return (
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/producer/register">
              Γίνε Παραγωγός
            </Link>
          </Button>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/login">
              Σύνδεση
            </Link>
          </Button>
          <Button size="sm" asChild>
            <Link href="/register">
              Εγγραφή
            </Link>
          </Button>
        </div>
      );
    }

    return (
      <NavigationMenu>
        <NavigationMenuList>
          <NavigationMenuItem>
            <NavigationMenuTrigger className="h-9 px-3">
              <div className="flex items-center gap-2">
                <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center">
                  <User className="h-3 w-3" />
                </div>
                <span className="text-sm font-medium">
                  {user.firstName || user?.email?.split('@')[0]}
                </span>
              </div>
            </NavigationMenuTrigger>
            <NavigationMenuContent>
              <div className="grid gap-3 p-4 w-[300px]">
                <div className="grid gap-1">
                  <p className="text-sm font-medium">{user.firstName} {user.lastName}</p>
                  <p className="text-xs text-muted-foreground">{user.email}</p>
                </div>
                
                <div className="grid gap-1">
                  <NavigationMenuLink asChild>
                    <Link
                      href={user.role === 'producer' ? '/producer/dashboard' : '/dashboard'}
                      className="flex items-center gap-2 rounded-md p-2 hover:bg-accent"
                    >
                      <Settings className="h-4 w-4" />
                      <span>Dashboard</span>
                    </Link>
                  </NavigationMenuLink>
                  
                  <NavigationMenuLink asChild>
                    <Link
                      href="/orders"
                      className="flex items-center gap-2 rounded-md p-2 hover:bg-accent"
                    >
                      <ShoppingBag className="h-4 w-4" />
                      <span>Παραγγελίες</span>
                    </Link>
                  </NavigationMenuLink>
                  
                  <NavigationMenuLink asChild>
                    <Link
                      href="/favorites"
                      className="flex items-center gap-2 rounded-md p-2 hover:bg-accent"
                    >
                      <Heart className="h-4 w-4" />
                      <span>Αγαπημένα</span>
                    </Link>
                  </NavigationMenuLink>
                </div>
                
                <div className="border-t pt-2">
                  <button
                    onClick={logout}
                    className="flex items-center gap-2 rounded-md p-2 hover:bg-accent w-full text-left text-destructive"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Αποσύνδεση</span>
                  </button>
                </div>
              </div>
            </NavigationMenuContent>
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>
    );
  };

  return (
    <nav className={cn("border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60", className)}>
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="text-2xl font-bold text-primary">Dixis</div>
            <Badge variant="secondary" className="text-xs hidden sm:inline-flex">
              Ελληνικά Προϊόντα
            </Badge>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            <NavigationMenu>
              <NavigationMenuList>
                <NavigationMenuItem>
                  <NavigationMenuLink className={navigationMenuTriggerStyle()} asChild>
                    <Link href="/">Αρχική</Link>
                  </NavigationMenuLink>
                </NavigationMenuItem>

                <NavigationMenuItem>
                  <NavigationMenuTrigger>Προϊόντα</NavigationMenuTrigger>
                  <NavigationMenuContent>
                    {renderCategoryMegaMenu()}
                  </NavigationMenuContent>
                </NavigationMenuItem>

                <NavigationMenuItem>
                  <NavigationMenuTrigger>Εξερεύνηση</NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <div className="grid gap-3 p-6 md:grid-cols-2 lg:w-[500px]">
                      {quickActions.map((action) => {
                        const Icon = action.icon;
                        return (
                          <ListItem
                            key={action.name}
                            title={
                              <div className="flex items-center gap-2">
                                <Icon className="h-4 w-4" />
                                <span>{action.name}</span>
                              </div>
                            }
                            href={action.href}
                          >
                            Ανακαλύψτε {action.name.toLowerCase()}
                          </ListItem>
                        );
                      })}
                      
                      <ListItem
                        title={
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4" />
                            <span>Παραγωγοί</span>
                          </div>
                        }
                        href="/producers"
                        className="md:col-span-2"
                      >
                        Γνωρίστε τους Έλληνες παραγωγούς
                      </ListItem>
                    </div>
                  </NavigationMenuContent>
                </NavigationMenuItem>

                <NavigationMenuItem>
                  <NavigationMenuLink className={navigationMenuTriggerStyle()} asChild>
                    <Link href="/about">Σχετικά</Link>
                  </NavigationMenuLink>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3">
            {/* Search */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSearchOpen(true)}
              className="hidden md:inline-flex"
            >
              <Search className="h-4 w-4" />
            </Button>

            {/* Cart */}
            <HeaderCartIcon />

            {/* User Menu - Desktop */}
            <div className="hidden md:block">
              {renderUserMenu()}
            </div>

            {/* Mobile Menu */}
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] sm:w-[400px]">
                <SheetHeader>
                  <SheetTitle>Μενού</SheetTitle>
                </SheetHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Link
                      href="/"
                      className="block px-3 py-2 rounded-md hover:bg-accent"
                      onClick={() => setMobileOpen(false)}
                    >
                      Αρχική
                    </Link>
                    <Link
                      href="/products"
                      className="block px-3 py-2 rounded-md hover:bg-accent"
                      onClick={() => setMobileOpen(false)}
                    >
                      Προϊόντα
                    </Link>
                    <Link
                      href="/producers"
                      className="block px-3 py-2 rounded-md hover:bg-accent"
                      onClick={() => setMobileOpen(false)}
                    >
                      Παραγωγοί
                    </Link>
                    <Link
                      href="/about"
                      className="block px-3 py-2 rounded-md hover:bg-accent"
                      onClick={() => setMobileOpen(false)}
                    >
                      Σχετικά
                    </Link>
                  </div>

                  {/* Categories in mobile */}
                  {featuredCategories.length > 0 && (
                    <div>
                      <h3 className="font-medium text-sm px-3 py-2 text-muted-foreground">
                        Κατηγορίες
                      </h3>
                      <div className="grid gap-1">
                        {featuredCategories.slice(0, 5).map((category) => (
                          <Link
                            key={category.id}
                            href={`/products?category=${category.slug}`}
                            className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-accent"
                            onClick={() => setMobileOpen(false)}
                          >
                            <span>{category.icon || '📦'}</span>
                            <span>{category.name}</span>
                            {category.product_count && (
                              <Badge variant="secondary" className="text-xs ml-auto">
                                {category.product_count}
                              </Badge>
                            )}
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Mobile user menu */}
                  {isAuthenticated && user ? (
                    <div className="border-t pt-4">
                      <div className="px-3 py-2">
                        <p className="font-medium">{user.firstName} {user.lastName}</p>
                        <p className="text-sm text-muted-foreground">{user.email}</p>
                      </div>
                      <div className="grid gap-1">
                        <Link
                          href={user.role === 'producer' ? '/producer/dashboard' : '/dashboard'}
                          className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-accent"
                          onClick={() => setMobileOpen(false)}
                        >
                          <Settings className="h-4 w-4" />
                          <span>Dashboard</span>
                        </Link>
                        <Link
                          href="/orders"
                          className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-accent"
                          onClick={() => setMobileOpen(false)}
                        >
                          <ShoppingBag className="h-4 w-4" />
                          <span>Παραγγελίες</span>
                        </Link>
                        <button
                          onClick={() => {
                            logout();
                            setMobileOpen(false);
                          }}
                          className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-accent w-full text-left text-destructive"
                        >
                          <LogOut className="h-4 w-4" />
                          <span>Αποσύνδεση</span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="border-t pt-4 grid gap-2">
                      <Button asChild onClick={() => setMobileOpen(false)}>
                        <Link href="/register">Εγγραφή</Link>
                      </Button>
                      <Button variant="outline" asChild onClick={() => setMobileOpen(false)}>
                        <Link href="/login">Σύνδεση</Link>
                      </Button>
                    </div>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  );
}