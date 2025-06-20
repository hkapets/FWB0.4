import { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
    icon?: ReactNode;
  };
  secondaryAction?: {
    label: string;
    onClick: () => void;
    icon?: ReactNode;
  };
  className?: string;
  variant?: "default" | "search" | "loading";
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  secondaryAction,
  className,
  variant = "default",
}: EmptyStateProps) {
  const variantStyles = {
    default: "py-24",
    search: "py-16",
    loading: "py-12",
  };

  const iconStyles = {
    default: "w-16 h-16 text-yellow-400 mb-4 animate-bounce",
    search: "w-12 h-12 text-gray-400 mb-3",
    loading: "w-8 h-8 text-gray-400 mb-2",
  };

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center text-center animate-fade-in",
        variantStyles[variant],
        className
      )}
    >
      {icon && (
        <div className={cn("animate-float", iconStyles[variant])}>{icon}</div>
      )}

      <h2 className="text-2xl font-bold mb-2 text-yellow-200">{title}</h2>

      <p className="mb-6 text-gray-400 max-w-md">{description}</p>

      <div className="flex flex-col sm:flex-row gap-3">
        {action && (
          <Button
            size="lg"
            onClick={action.onClick}
            className="animate-slide-in-from-bottom"
            style={{ animationDelay: "200ms" }}
          >
            {action.icon && <span className="mr-2">{action.icon}</span>}
            {action.label}
          </Button>
        )}

        {secondaryAction && (
          <Button
            variant="outline"
            onClick={secondaryAction.onClick}
            className="animate-slide-in-from-bottom"
            style={{ animationDelay: "400ms" }}
          >
            {secondaryAction.icon && (
              <span className="mr-2">{secondaryAction.icon}</span>
            )}
            {secondaryAction.label}
          </Button>
        )}
      </div>
    </div>
  );
}

// Спеціалізовані empty states для різних секцій
export function BestiaryEmptyState({ onCreate }: { onCreate: () => void }) {
  return (
    <EmptyState
      icon="🐉"
      title="Немає істот"
      description="Створіть першу істоту для вашого світу. Додайте унікальних персонажів, які населять ваш світ."
      action={{
        label: "Створити істоту",
        onClick: onCreate,
        icon: "➕",
      }}
    />
  );
}

export function ArtifactsEmptyState({ onCreate }: { onCreate: () => void }) {
  return (
    <EmptyState
      icon="⚔️"
      title="Немає артефактів"
      description="Створіть магічні артефакти та предмети, які існують у вашому світі."
      action={{
        label: "Створити артефакт",
        onClick: onCreate,
        icon: "➕",
      }}
    />
  );
}

export function EventsEmptyState({ onCreate }: { onCreate: () => void }) {
  return (
    <EmptyState
      icon="📅"
      title="Немає подій"
      description="Додайте важливі події та історичні моменти, які формують ваш світ."
      action={{
        label: "Створити подію",
        onClick: onCreate,
        icon: "➕",
      }}
    />
  );
}

export function SearchEmptyState({ onClear }: { onClear: () => void }) {
  return (
    <EmptyState
      variant="search"
      icon="🔍"
      title="Немає результатів"
      description="Спробуйте змінити фільтри або пошуковий запит для знаходження потрібного контенту."
      secondaryAction={{
        label: "Очистити фільтри",
        onClick: onClear,
        icon: "🔄",
      }}
    />
  );
}

export function LoadingEmptyState() {
  return (
    <EmptyState
      variant="loading"
      icon="⏳"
      title="Завантаження..."
      description="Будь ласка, зачекайте поки дані завантажуються."
    />
  );
}
