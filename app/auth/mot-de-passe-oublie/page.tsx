"use client";

import Image from "next/image";
import Link from "next/link";
import { useActionState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowLeft, CheckCircle2 } from "lucide-react";

import { requestPasswordResetAction, type AuthFormState } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { siteConfig } from "@/config/site";

const schema = z.object({
  email: z.string().email("Email invalide"),
});

type Schema = z.infer<typeof schema>;
const initialState: AuthFormState = {};

export default function MotDePasseOubliePage() {
  const [state, formAction] = useActionState(requestPasswordResetAction, initialState);

  const form = useForm<Schema>({
    resolver: zodResolver(schema),
    defaultValues: { email: "" },
  });

  return (
    <div className="grid min-h-screen grid-cols-1 md:grid-cols-[0.95fr_1.05fr]">
      <div className="relative flex flex-col justify-start gap-8 bg-slate-100 p-8 md:p-10">
        <div className="absolute inset-0 overflow-hidden">
          <Image src="/img.png" alt="" fill className="object-cover opacity-20" />
        </div>
        <div className="relative z-10">
          <Link
            href="/auth"
            className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-black"
          >
            <ArrowLeft className="h-4 w-4" />
            Retour à la connexion
          </Link>
          <p className="mt-6 text-lg font-semibold text-black">{siteConfig.name}</p>
          <div className="mt-1 h-0.5 w-12 bg-[#213398]" />
          <h2 className="mt-6 text-2xl font-bold text-black">Mot de passe oublié</h2>
          <p className="mt-3 text-sm leading-relaxed text-slate-600">
            Entrez votre adresse email. Nous vous enverrons un lien pour réinitialiser votre mot de passe.
          </p>
        </div>
        <ul className="relative z-10 space-y-3">
          <li className="flex items-center gap-2 text-sm text-slate-700">
            <CheckCircle2 className="h-4 w-4 text-[#3b82f6]" />
            Lien sécurisé par email
          </li>
          <li className="flex items-center gap-2 text-sm text-slate-700">
            <CheckCircle2 className="h-4 w-4 text-[#3b82f6]" />
            Valide 1 heure
          </li>
        </ul>
      </div>

      <div className="relative flex flex-col bg-white p-6 md:p-10">
        <form action={formAction} className="mt-8 flex max-w-md flex-col">
          <h3 className="text-xl font-bold text-black">Réinitialiser mon mot de passe</h3>
          <div className="mt-5 space-y-2">
            <label className="text-sm font-medium text-slate-700">Email</label>
            <Input
              type="email"
              placeholder="votre@email.com"
              {...form.register("email")}
              className="h-11 border-slate-200"
            />
            {form.formState.errors.email && (
              <p className="text-xs text-red-600">{form.formState.errors.email.message}</p>
            )}
          </div>
          {state.error && <p className="mt-3 text-sm text-red-600">{state.error}</p>}
          {state.success && (
            <div className="mt-3 rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
              {state.success}
            </div>
          )}
          <Button type="submit" className="mt-5 h-11 w-full bg-[#213398] hover:bg-[#1a2980]">
            Envoyer le lien
          </Button>
        </form>
        <p className="mt-6 text-center text-sm text-slate-500">
          <Link href="/auth" className="font-semibold text-black hover:underline">
            Retour à la connexion
          </Link>
        </p>
      </div>
    </div>
  );
}
