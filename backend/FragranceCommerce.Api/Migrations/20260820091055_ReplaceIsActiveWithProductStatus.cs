using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace FragranceCommerce.Api.Migrations
{
    /// <inheritdoc />
    public partial class ReplaceIsActiveWithProductStatus : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Add Status column with default 0 (Draft)
            migrationBuilder.AddColumn<int>(
                name: "Status",
                table: "Products",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            // Migrate existing data: IsActive=true -> Status=1 (Active)
            migrationBuilder.Sql(
                "UPDATE \"Products\" SET \"Status\" = 1 WHERE \"IsActive\" = true");

            migrationBuilder.DropColumn(
                name: "IsActive",
                table: "Products");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "IsActive",
                table: "Products",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.Sql(
                "UPDATE \"Products\" SET \"IsActive\" = true WHERE \"Status\" = 1");

            migrationBuilder.DropColumn(
                name: "Status",
                table: "Products");
        }
    }
}
