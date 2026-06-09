using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace FragranceCommerce.Api.Migrations
{
    /// <inheritdoc />
    public partial class ConvertOrderStatusToEnum : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"
                ALTER TABLE ""Orders""
                ALTER COLUMN ""Status"" TYPE integer
                USING CASE ""Status""
                    WHEN 'Pending' THEN 1
                    WHEN 'Confirmed' THEN 2
                    WHEN 'Shipped' THEN 3
                    WHEN 'Delivered' THEN 4
                    WHEN 'Cancelled' THEN 5
                    ELSE 1
                END;
            ");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"
                ALTER TABLE ""Orders""
                ALTER COLUMN ""Status"" TYPE text
                USING CASE ""Status""
                    WHEN 1 THEN 'Pending'
                    WHEN 2 THEN 'Confirmed'
                    WHEN 3 THEN 'Shipped'
                    WHEN 4 THEN 'Delivered'
                    WHEN 5 THEN 'Cancelled'
                    ELSE 'Pending'
                END;
            ");
        }
    }
}
