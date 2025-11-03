using System;

namespace RazorKing.Helpers
{
    public static class ImageHelper
    {
        private static readonly string[] BarbershopImages = new string[]
        {
            "unrecognizable-barber-cutting-hair-man",
            "young-man-barbershop-trimming-hair",
            "handsome-man-cutting-beard-barber-salon",
            "great-time-barbershop-cheerful-young-bearded-man-getting-haircut-by-hairdresser-while-sitting-chair-barbershop",
            "client-doing-hair-cut-barber-shop-salon (1)",
            "client-doing-hair-cut-barber-shop-salon",
            "handsome-man-barber-shop-styling-hair"
        };

        /// <summary>
        /// Get a barbershop image URL based on ID for consistent image assignment
        /// </summary>
        /// <param name="barbershopId">The barbershop ID</param>
        /// <returns>Image URL path</returns>
        public static string GetBarbershopImage(int barbershopId)
        {
            var imageIndex = Math.Abs(barbershopId) % BarbershopImages.Length;
            return $"/img/{BarbershopImages[imageIndex]}.jpg";
        }

        /// <summary>
        /// Get a city image URL based on index for consistent image assignment
        /// </summary>
        /// <param name="cityIndex">The city index</param>
        /// <returns>Image URL path</returns>
        public static string GetCityImage(int cityIndex)
        {
            var imageIndex = cityIndex % BarbershopImages.Length;
            return $"/img/{BarbershopImages[imageIndex]}.jpg";
        }

        /// <summary>
        /// Get a random barbershop image URL
        /// </summary>
        /// <returns>Random image URL path</returns>
        public static string GetRandomBarbershopImage()
        {
            var random = new Random();
            var imageIndex = random.Next(BarbershopImages.Length);
            return $"/img/{BarbershopImages[imageIndex]}.jpg";
        }

        /// <summary>
        /// Get all available barbershop image names
        /// </summary>
        /// <returns>Array of image names</returns>
        public static string[] GetAllBarbershopImages()
        {
            return (string[])BarbershopImages.Clone();
        }
    }
}