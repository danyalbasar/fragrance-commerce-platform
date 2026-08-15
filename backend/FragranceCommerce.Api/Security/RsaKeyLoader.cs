using System.Security.Cryptography;
using System.Text;

namespace FragranceCommerce.Api.Security;

public static class RsaKeyLoader
{
    public static RSA Load(string value)
    {
        var rsa = RSA.Create(2048);

        if (value.Contains("PRIVATE KEY"))
        {
            rsa.ImportFromPem(value);
        }
        else
        {
            var pem = Encoding.UTF8.GetString(Convert.FromBase64String(value));
            rsa.ImportFromPem(pem);
        }

        return rsa;
    }
}
