namespace FragranceCommerce.Api.Exceptions;

public class EmailNotVerifiedException : InvalidOperationException
{
    public EmailNotVerifiedException(string message)
        : base(message)
    {
    }
}
