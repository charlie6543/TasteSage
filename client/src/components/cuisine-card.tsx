interface CuisineCardProps {
  name: string;
  image: string;
  onClick: () => void;
}

export function CuisineCard({ name, image, onClick }: CuisineCardProps) {
  return (
    <div className="group cursor-pointer" onClick={onClick}>
      <div className="relative rounded-xl overflow-hidden mb-3">
        <img
          src={image}
          alt={`${name} cuisine`}
          className="w-full h-32 object-cover group-hover:scale-110 transition-transform duration-300"
        />
        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors duration-300" />
      </div>
      <h4 className="text-center font-poppins font-semibold text-foreground group-hover:text-primary transition-colors duration-200">
        {name}
      </h4>
    </div>
  );
}
