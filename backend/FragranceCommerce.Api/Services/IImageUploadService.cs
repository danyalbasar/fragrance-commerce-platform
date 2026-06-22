public interface IImageUploadService
{
    Task<string> UploadImageAsync(IFormFile file);
    Task<string> UploadImageAsync(
        string filePath,
        string publicId);
}