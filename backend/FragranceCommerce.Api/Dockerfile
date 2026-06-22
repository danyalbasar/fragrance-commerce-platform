FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

COPY . .
RUN dotnet restore
RUN dotnet publish -c Release -o /app/publish

FROM mcr.microsoft.com/dotnet/aspnet:8.0
WORKDIR /app

COPY --from=build /app/publish .
COPY --from=build /src/SeedImages ./SeedImages

EXPOSE 8080

ENTRYPOINT ["dotnet", "FragranceCommerce.Api.dll"]