using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Onconet.Web.Migrations;

/// <inheritdoc />
public partial class changeAuthorName : Migration
{
    /// <inheritdoc />
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.DropForeignKey(
            name: "FK_Articles_AspNetUsers_AutherId",
            table: "Articles");

        migrationBuilder.DropIndex(
            name: "IX_Articles_AutherId",
            table: "Articles");

        migrationBuilder.DropColumn(
            name: "AutherId",
            table: "Articles");

        migrationBuilder.CreateIndex(
            name: "IX_Articles_AuthorId",
            table: "Articles",
            column: "AuthorId");

        migrationBuilder.AddForeignKey(
            name: "FK_Articles_AspNetUsers_AuthorId",
            table: "Articles",
            column: "AuthorId",
            principalTable: "AspNetUsers",
            principalColumn: "Id",
            onDelete: ReferentialAction.Cascade);
    }

    /// <inheritdoc />
    protected override void Down(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.DropForeignKey(
            name: "FK_Articles_AspNetUsers_AuthorId",
            table: "Articles");

        migrationBuilder.DropIndex(
            name: "IX_Articles_AuthorId",
            table: "Articles");

        migrationBuilder.AddColumn<int>(
            name: "AutherId",
            table: "Articles",
            type: "int",
            nullable: false,
            defaultValue: 0);

        migrationBuilder.CreateIndex(
            name: "IX_Articles_AutherId",
            table: "Articles",
            column: "AutherId");

        migrationBuilder.AddForeignKey(
            name: "FK_Articles_AspNetUsers_AutherId",
            table: "Articles",
            column: "AutherId",
            principalTable: "AspNetUsers",
            principalColumn: "Id",
            onDelete: ReferentialAction.Cascade);
    }
}
