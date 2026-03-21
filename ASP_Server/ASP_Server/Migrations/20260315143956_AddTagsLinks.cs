using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ASP_Server.Migrations
{
    /// <inheritdoc />
    public partial class AddTagsLinks : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "FileLinks",
                columns: table => new
                {
                    SourceFileId = table.Column<Guid>(type: "char(36)", nullable: false, collation: "ascii_general_ci"),
                    TargetFileId = table.Column<Guid>(type: "char(36)", nullable: false, collation: "ascii_general_ci")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_FileLinks", x => new { x.SourceFileId, x.TargetFileId });
                    table.ForeignKey(
                        name: "FK_FileLinks_Files_SourceFileId",
                        column: x => x.SourceFileId,
                        principalTable: "Files",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_FileLinks_Files_TargetFileId",
                        column: x => x.TargetFileId,
                        principalTable: "Files",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "Tags",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "char(36)", nullable: false, collation: "ascii_general_ci"),
                    Index = table.Column<string>(type: "longtext", nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    EncryptedName = table.Column<string>(type: "longtext", nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    Iv = table.Column<string>(type: "longtext", nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Tags", x => x.Id);
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "FileTag",
                columns: table => new
                {
                    FilesId = table.Column<Guid>(type: "char(36)", nullable: false, collation: "ascii_general_ci"),
                    TagsId = table.Column<Guid>(type: "char(36)", nullable: false, collation: "ascii_general_ci")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_FileTag", x => new { x.FilesId, x.TagsId });
                    table.ForeignKey(
                        name: "FK_FileTag_Files_FilesId",
                        column: x => x.FilesId,
                        principalTable: "Files",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_FileTag_Tags_TagsId",
                        column: x => x.TagsId,
                        principalTable: "Tags",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateIndex(
                name: "IX_FileLinks_TargetFileId",
                table: "FileLinks",
                column: "TargetFileId");

            migrationBuilder.CreateIndex(
                name: "IX_FileTag_TagsId",
                table: "FileTag",
                column: "TagsId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "FileLinks");

            migrationBuilder.DropTable(
                name: "FileTag");

            migrationBuilder.DropTable(
                name: "Tags");
        }
    }
}
