import React, { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function AuthPage() {
  const [, setLocation] = useLocation();
  const [loading, setLoading] = useState(false);

  // Login form state
  const [loginCreds, setLoginCreds] = useState({ email: "", password: "" });

  // Registration form state
  const [registerData, setRegisterData] = useState({
    email: "",
    password: "",
    name: "",
    gmailAddress: "",
    githubLink: "",
    linkedinLink: "",
  });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(loginCreds),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Login failed");
      }

      const data = await response.json();
      
      // Redirect based on user role
      if (data.user?.role === "admin") {
        setLocation("/");
      } else {
        setLocation("/posts");
      }
    } catch (err: any) {
      console.error(err);
      alert(err.message || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(registerData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Registration failed");
      }

      // Redirect to posts after registration
      setLocation("/posts");
    } catch (err: any) {
      console.error(err);
      alert(err.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = () => {
    setLocation("/posts");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        <Card className="shadow-lg">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl">Welcome</CardTitle>
            <CardDescription className="text-base mt-2">
              Join us or continue as guest
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="login">Login</TabsTrigger>
                <TabsTrigger value="register">Register</TabsTrigger>
              </TabsList>

              {/* Login Tab */}
              <TabsContent value="login" className="space-y-4">
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="login-email">Email</Label>
                    <Input
                      id="login-email"
                      type="email"
                      placeholder="your@email.com"
                      value={loginCreds.email}
                      onChange={(e) =>
                        setLoginCreds({ ...loginCreds, email: e.target.value })
                      }
                      disabled={loading}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="login-password">Password</Label>
                    <Input
                      id="login-password"
                      type="password"
                      placeholder="Enter your password"
                      value={loginCreds.password}
                      onChange={(e) =>
                        setLoginCreds({ ...loginCreds, password: e.target.value })
                      }
                      disabled={loading}
                      required
                    />
                  </div>

                  <Button type="submit" disabled={loading} className="w-full">
                    {loading ? "Logging in..." : "Login"}
                  </Button>
                </form>
              </TabsContent>

              {/* Registration Tab */}
              <TabsContent value="register" className="space-y-4">
                <form onSubmit={handleRegister} className="space-y-4 max-h-96 overflow-y-auto pr-2">
                  <div className="space-y-2">
                    <Label htmlFor="reg-name">Full Name *</Label>
                    <Input
                      id="reg-name"
                      type="text"
                      placeholder="John Doe"
                      value={registerData.name}
                      onChange={(e) =>
                        setRegisterData({ ...registerData, name: e.target.value })
                      }
                      disabled={loading}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="reg-email">Email *</Label>
                    <Input
                      id="reg-email"
                      type="email"
                      placeholder="your@email.com"
                      value={registerData.email}
                      onChange={(e) =>
                        setRegisterData({ ...registerData, email: e.target.value })
                      }
                      disabled={loading}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="reg-password">Password *</Label>
                    <Input
                      id="reg-password"
                      type="password"
                      placeholder="Create a strong password"
                      value={registerData.password}
                      onChange={(e) =>
                        setRegisterData({ ...registerData, password: e.target.value })
                      }
                      disabled={loading}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="reg-gmail">Gmail Address (Optional)</Label>
                    <Input
                      id="reg-gmail"
                      type="email"
                      placeholder="your.gmail@gmail.com"
                      value={registerData.gmailAddress}
                      onChange={(e) =>
                        setRegisterData({ ...registerData, gmailAddress: e.target.value })
                      }
                      disabled={loading}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="reg-github">GitHub Link (Optional)</Label>
                    <Input
                      id="reg-github"
                      type="url"
                      placeholder="https://github.com/username"
                      value={registerData.githubLink}
                      onChange={(e) =>
                        setRegisterData({ ...registerData, githubLink: e.target.value })
                      }
                      disabled={loading}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="reg-linkedin">LinkedIn Profile (Optional)</Label>
                    <Input
                      id="reg-linkedin"
                      type="url"
                      placeholder="https://linkedin.com/in/username"
                      value={registerData.linkedinLink}
                      onChange={(e) =>
                        setRegisterData({ ...registerData, linkedinLink: e.target.value })
                      }
                      disabled={loading}
                    />
                  </div>

                  <Button type="submit" disabled={loading} className="w-full">
                    {loading ? "Creating Account..." : "Register"}
                  </Button>

                  <p className="text-xs text-muted-foreground text-center">
                    * Required fields
                  </p>
                </form>
              </TabsContent>
            </Tabs>

            {/* Skip Button */}
            <div className="mt-6 space-y-3">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-background text-muted-foreground">
                    or
                  </span>
                </div>
              </div>
              <Button 
                type="button" 
                variant="outline" 
                onClick={handleSkip}
                className="w-full"
              >
                Continue as Guest
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
