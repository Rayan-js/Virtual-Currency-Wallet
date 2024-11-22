# Etapa de build
FROM node:18-alpine AS builder

# Definir variáveis de ambiente para produção
ENV NODE_ENV=production

WORKDIR /app

# Copiar apenas os arquivos necessários para instalar dependências
COPY package*.json ./
RUN npm install --legacy-peer-deps

# Copiar o restante do código e realizar o build
COPY . .
RUN npm run build

# Etapa de produção
FROM node:18-alpine

# Definir variáveis de ambiente para produção
ENV NODE_ENV=production

WORKDIR /app

# Copiar apenas o necessário para a execução
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package*.json ./
RUN npm install --only=production --legacy-peer-deps

# Expor a porta 3000
EXPOSE 3000

# Comando para iniciar a aplicação
CMD ["node", "dist/main.js"]
