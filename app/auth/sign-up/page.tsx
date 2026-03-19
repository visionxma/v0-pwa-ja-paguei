import { signup } from '@/app/auth/actions'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Check } from 'lucide-react'

export default function SignUpPage() {
  return (
    <div className="min-h-screen flex">
      {/* Left side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-sidebar items-center justify-center p-12">
        <div className="max-w-md">
          <div className="flex items-center justify-center w-20 h-20 bg-primary rounded-2xl mb-8">
            <span className="text-primary-foreground font-bold text-3xl">JP</span>
          </div>
          <h1 className="text-4xl font-bold text-sidebar-foreground mb-4">
            Comece a usar agora
          </h1>
          <p className="text-sidebar-foreground/70 text-lg leading-relaxed mb-8">
            Crie sua conta gratuita e comece a dividir despesas de forma inteligente.
          </p>
          
          <div className="space-y-4">
            {[
              'Divida despesas facilmente',
              'Crie grupos com amigos',
              'Acompanhe seus gastos',
              'Receba notificações',
              'Totalmente gratuito'
            ].map((feature, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="flex items-center justify-center w-6 h-6 bg-primary rounded-full">
                  <Check className="h-4 w-4 text-primary-foreground" />
                </div>
                <span className="text-sidebar-foreground">{feature}</span>
              </div>
            ))}
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
              Criar conta
            </CardTitle>
            <CardDescription>
              Preencha os dados abaixo para começar
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <form className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-foreground font-medium">
                  Nome (opcional)
                </Label>
                <Input
                  id="name"
                  name="name"
                  type="text"
                  placeholder="Seu nome"
                  className="h-12 bg-input border-border focus:border-primary"
                />
              </div>

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
                <Label htmlFor="password" className="text-foreground font-medium">
                  Senha
                </Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="Mínimo 6 caracteres"
                  required
                  minLength={6}
                  className="h-12 bg-input border-border focus:border-primary"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirm-password" className="text-foreground font-medium">
                  Confirmar Senha
                </Label>
                <Input
                  id="confirm-password"
                  name="confirm-password"
                  type="password"
                  placeholder="Repita a senha"
                  required
                  minLength={6}
                  className="h-12 bg-input border-border focus:border-primary"
                />
              </div>

              <Button
                formAction={signup}
                className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-base"
              >
                Criar minha conta
              </Button>
            </form>

            <p className="text-xs text-muted-foreground text-center mt-4">
              Ao criar uma conta, você concorda com nossos{' '}
              <Link href="/terms" className="text-primary hover:underline">
                termos
              </Link>
              {' '}e{' '}
              <Link href="/privacy" className="text-primary hover:underline">
                política de privacidade
              </Link>
            </p>

            <div className="relative my-8">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-card text-muted-foreground">
                  Já tem uma conta?
                </span>
              </div>
            </div>

            <Link href="/auth/login" className="block">
              <Button 
                variant="outline" 
                className="w-full h-12 border-2 border-muted-foreground/30 text-foreground hover:border-primary hover:text-primary font-semibold text-base transition-colors"
              >
                Entrar na minha conta
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
