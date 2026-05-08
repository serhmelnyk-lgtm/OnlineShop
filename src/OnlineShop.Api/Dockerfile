FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src

COPY OnlineShop.slnx ./
COPY src/OnlineShop.Domain/OnlineShop.Domain.csproj src/OnlineShop.Domain/
COPY src/OnlineShop.Application/OnlineShop.Application.csproj src/OnlineShop.Application/
COPY src/OnlineShop.Infrastructure/OnlineShop.Infrastructure.csproj src/OnlineShop.Infrastructure/
COPY src/OnlineShop.Api/OnlineShop.Api.csproj src/OnlineShop.Api/

RUN dotnet restore src/OnlineShop.Api/OnlineShop.Api.csproj

COPY src/ src/
RUN dotnet publish src/OnlineShop.Api/OnlineShop.Api.csproj -c Release -o /app/publish

FROM mcr.microsoft.com/dotnet/aspnet:9.0
WORKDIR /app
COPY --from=build /app/publish .
EXPOSE 8080
ENTRYPOINT ["dotnet", "OnlineShop.Api.dll"]

