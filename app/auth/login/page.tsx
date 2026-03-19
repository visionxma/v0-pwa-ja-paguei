import { login } from '@/app/auth/actions'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'

export default function LoginPage() {
  return (
    <div className="min-h-screen flex">
      {/* Left side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-sidebar items-center justify-center p-12">
        <div className="max-w-md text-center">
          <div className="flex items-center justify-center w-20 h-20 bg-primary rounded-2xl mx-auto mb-8">
            <span className="text-primary-foreground font-bold text-3xl">JP</span>
          </div>
          <h1 className="text-4xl font-bold text-sidebar-foreground mb-4">
            Já Paguei
          </h1>
          <p className="text-sidebar-foreground/70 text-lg leading-relaxed">
            A maneira mais inteligente de dividir despesas com amigos, família e colegas de trabalho.
          </p>
          <div className="mt-12 grid grid-cols-3 gap-4">
            <div className="bg-sidebar-accent rounded-lg p-4">
              <p className="text-2xl font-bold text-sidebar-foreground">100%</p>
              <p className="text-sm text-sidebar-foreground/60">Gratuito</p>
            </div>
            <div className="bg-sidebar-accent rounded-lg p-4">
              <p className="text-2xl font-bold text-sidebar-foreground">Fácil</p>
              <p className="text-sm text-sidebar-foreground/60">De usar</p>
            </div>
            <div className="bg-sidebar-accent rounded-lg p-4">
              <p className="text-2xl font-bold text-sidebar-foreground">Seguro</p>
              <p className="text-sm text-sidebar-foreground/60">Seus dados</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right side - Form */}
      <div className="flex-1 flex items-center justify-center p-6 bg-background">
        <Card className="w-full max-w-md border-0 shadow-xl">
          <CardHeader className="text-center pb-2">
            <div className="lg:hidden flex items-center justify-center w-14 h-14 bg-primary rounded-xl mx-auto mb-4">
              <span className="text-primary-foreground font-bold text-xl">JP</span>
            </div>
            <CardTitle className="text-2xl font-bold text-foreground">
              Bem-vindo de volta
            </CardTitle>
            <CardDescription>
              Entre com sua conta para continuar
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <form className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-foreground font-medium">
                  Email
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="seu@email.com"
                  required
                  className="h-12 bg-input border-border focus:border-primary"
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-foreground font-medium">
                    Senha
                  </Label>
                  <Link href="/auth/forgot-password" className="text-sm text-primary hover:underline">
                    Esqueceu a senha?
                  </Link>
                </div>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="Digite sua senha"
                  required
                  className="h-12 bg-input border-border focus:border-primary"
                />
              </div>

              <Button
                formAction={login}
                className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-base"
              >
                Entrar
              </Button>
            </form>

            <div className="relative my-8">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-card text-muted-foreground">
                  Não tem uma conta?
                </span>
              </div>
            </div>

            <Link href="/auth/sign-up" className="block">
              <Button 
                variant="outline" 
                className="w-full h-12 border-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground font-semibold text-base transition-colors"
              >
                Criar conta grátis
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
