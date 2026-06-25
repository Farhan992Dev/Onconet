using Onconet.Web.Models;

namespace Onconet.Web.Services;

public interface IJwtService
{
    string GenerateToken(DbUser user);
}
