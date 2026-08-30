using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace FragranceCommerce.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddGatewayOrderIdToPayments : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "GatewayOrderId",
                table: "Payments",
                type: "text",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "GatewayOrderId",
                table: "Payments");
        }
    }
}
