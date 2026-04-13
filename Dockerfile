# ─── Stage 1: Dependências ───────────────────────────────────────────────────
FROM node:20-alpine AS deps
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

# ─── Stage 2: Build ───────────────────────────────────────────────────────────
FROM node:20-alpine AS builder
WORKDIR /app

# Recebe a URL do backend como argumento de build
# NEXT_PUBLIC_* é embutida no bundle em tempo de build — não funciona como env em runtime
ARG NEXT_PUBLIC_API_JAVA
ENV NEXT_PUBLIC_API_JAVA=$NEXT_PUBLIC_API_JAVA

COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN npm run build

# ─── Stage 3: Runner ─────────────────────────────────────────────────────────
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
# Next.js sobe na 3000 por padrão — não alterar aqui
ENV PORT=3000

# Apenas os arquivos necessários para produção
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

EXPOSE 3000

CMD ["node", "server.js"]
