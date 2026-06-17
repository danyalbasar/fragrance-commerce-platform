using CloudinaryDotNet;
using CloudinaryDotNet.Actions;
using FragranceCommerce.Api.Settings;
using Microsoft.Extensions.Options;

namespace FragranceCommerce.Api.Services;

public class CloudinaryImageUploadService : IImageUploadService
{
    private readonly Cloudinary _cloudinary;

    public CloudinaryImageUploadService(
        IOptions<CloudinarySettings> options)
    {
        var settings = options.Value;

        var account = new Account(
            settings.CloudName,
            settings.ApiKey,
            settings.ApiSecret);

        _cloudinary = new Cloudinary(account);
    }

    public async Task<string> UploadImageAsync(IFormFile file)
    {
        if (file == null || file.Length == 0)
            throw new InvalidOperationException("No file uploaded.");

        if (!file.ContentType.StartsWith("image/"))
            throw new InvalidOperationException("Only image files are allowed.");

        await using var stream = file.OpenReadStream();

        var uploadParams = new ImageUploadParams
        {
            File = new FileDescription(file.FileName, stream),
            Folder = "fragrance-commerce"
        };

        var uploadResult = await _cloudinary.UploadAsync(uploadParams);

        if (uploadResult.Error != null)
            throw new InvalidOperationException(uploadResult.Error.Message);

        return uploadResult.SecureUrl.ToString();
    }
}