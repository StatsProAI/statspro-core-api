# Etapa 1: Build
FROM node:20 AS builder

WORKDIR /app

# Copia os arquivos de dependência
COPY package.json yarn.lock ./

# Instala as dependências (com as devs, para conseguir buildar)
RUN yarn install

# Copia o restante do projeto
COPY . .

# Builda o projeto NestJS
RUN yarn build

# Etapa 2: Runtime
FROM node:20-alpine AS runner

WORKDIR /app

# Copia apenas o necessário para rodar
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package.json ./
COPY --from=builder /app/node_modules ./node_modules

# Expondo a porta (ajuste se necessário)
EXPOSE 3000

# Comando para rodar a aplicação
CMD ["node", "dist/main.js"]
