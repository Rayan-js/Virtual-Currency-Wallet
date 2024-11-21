# Use a imagem oficial do Node.js como base
FROM node:18

# Define o diretório de trabalho no container
WORKDIR /usr/src/app

# Copia o package.json e o package-lock.json
COPY package*.json ./

# Instala as dependências do projeto
RUN npm install

# Copia o restante dos arquivos da aplicação
COPY . .

# Build da aplicação (se necessário)
RUN npm run build

# Exponha a porta que o Nest.js está rodando
EXPOSE 3000

# Comando para iniciar a aplicação
CMD ["npm", "run", "start:prod"]
