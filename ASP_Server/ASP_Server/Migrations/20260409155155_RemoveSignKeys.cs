using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ASP_Server.Migrations
{
    /// <inheritdoc />
    public partial class RemoveSignKeys : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "EncryptedSigningPrivateKey",
                table: "AspNetUsers");

            migrationBuilder.DropColumn(
                name: "SigningKeyIv",
                table: "AspNetUsers");

            migrationBuilder.DropColumn(
                name: "SigningPublicKey",
                table: "AspNetUsers");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "EncryptedSigningPrivateKey",
                table: "AspNetUsers",
                type: "longtext",
                nullable: true)
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.AddColumn<string>(
                name: "SigningKeyIv",
                table: "AspNetUsers",
                type: "longtext",
                nullable: true)
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.AddColumn<string>(
                name: "SigningPublicKey",
                table: "AspNetUsers",
                type: "longtext",
                nullable: true)
                .Annotation("MySql:CharSet", "utf8mb4");
        }
    }
}
