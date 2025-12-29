import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import { CalendarIcon, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { ImageUploader } from './ImageUploader';
import { TechStackInput } from './TechStackInput';
import { PROJECT_CATEGORIES, PROJECT_STATUS } from '@/lib/projectConstants';
import { useCreateProject, useUpdateProject } from '@/hooks/mutations/project';
import { Project } from '@/types/types';
import { cn } from '@/lib/utils';

const projectSchema = z.object({
    title: z.string().min(3, 'Title must be at least 3 characters').max(100),
    description: z.string().min(10, 'Description must be at least 10 characters').max(5000),
    tagline: z.string().max(150).optional(),
    techStack: z.array(z.string()).min(1, 'Add at least one technology'),
    category: z.string().min(1, 'Category is required'),
    status: z.string(),
    repositoryUrl: z.string().url('Invalid URL').optional().or(z.literal('')),
    liveUrl: z.string().url('Invalid URL').optional().or(z.literal('')),
    demoVideoUrl: z.string().url('Invalid URL').optional().or(z.literal('')),
    startDate: z.date().optional(),
    endDate: z.date().optional(),
});

type ProjectFormData = z.infer<typeof projectSchema>;

interface ProjectFormDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    project?: Project; // For edit mode
}

export function ProjectFormDialog({ open, onOpenChange, project }: ProjectFormDialogProps) {
    const isEditMode = !!project;
    const [coverImage, setCoverImage] = useState<File[]>([]);
    const [images, setImages] = useState<File[]>([]);
    const [existingCoverImage, setExistingCoverImage] = useState<string | undefined>(project?.coverImage);
    const [existingImages, setExistingImages] = useState<string[]>(project?.images || []);

    // Wrapper to log state changes
    const setCoverImageWithLog = (files: File[]) => {
        console.log('🖼️ [ProjectForm] Cover image state updated:', {
            count: files.length,
            fileName: files[0]?.name,
            fileType: files[0]?.constructor?.name,
        });
        setCoverImage(files);
    };

    const setImagesWithLog = (files: File[]) => {
        console.log('🖼️ [ProjectForm] Images state updated:', {
            count: files.length,
            firstFileName: files[0]?.name,
        });
        setImages(files);
    };

    const { mutate: createProject, isPending: isCreating } = useCreateProject({
        onSuccess: () => {
            onOpenChange(false);
            reset();
        },
    });

    const { mutate: updateProject, isPending: isUpdating } = useUpdateProject(
        project?.id || '',
        {
            onSuccess: () => {
                onOpenChange(false);
            },
        }
    );

    const {
        register,
        handleSubmit,
        formState: { errors },
        setValue,
        watch,
        reset,
    } = useForm<ProjectFormData>({
        resolver: zodResolver(projectSchema),
        defaultValues: {
            title: project?.title || '',
            description: project?.description || '',
            tagline: project?.tagline || '',
            techStack: project?.techStack || [],
            category: project?.category || '',
            status: project?.status || 'completed',
            repositoryUrl: project?.repositoryUrl || '',
            liveUrl: project?.liveUrl || '',
            demoVideoUrl: project?.demoVideoUrl || '',
            startDate: project?.startDate ? new Date(project.startDate) : undefined,
            endDate: project?.endDate ? new Date(project.endDate) : undefined,
        },
    });

    const techStack = watch('techStack');
    const category = watch('category');
    const status = watch('status');
    const startDate = watch('startDate');
    const endDate = watch('endDate');

    useEffect(() => {
        if (project && open) {
            setValue('title', project.title);
            setValue('description', project.description);
            setValue('tagline', project.tagline || '');
            setValue('techStack', project.techStack || []);
            setValue('category', project.category || '');
            setValue('status', project.status);
            setValue('repositoryUrl', project.repositoryUrl || '');
            setValue('liveUrl', project.liveUrl || '');
            setValue('demoVideoUrl', project.demoVideoUrl || '');
            setValue('startDate', project.startDate ? new Date(project.startDate) : undefined);
            setValue('endDate', project.endDate ? new Date(project.endDate) : undefined);
            setExistingCoverImage(project.coverImage);
            setExistingImages(project.images || []);
        }
    }, [project, open, setValue]);

    const onSubmit = (data: ProjectFormData) => {
        // Prepare the submission data with proper file handling
        const submitData: any = {
            title: data.title,
            description: data.description,
            tagline: data.tagline,
            techStack: data.techStack,
            category: data.category,
            status: data.status,
            repositoryUrl: data.repositoryUrl,
            liveUrl: data.liveUrl,
            demoVideoUrl: data.demoVideoUrl,
            startDate: data.startDate,
            endDate: data.endDate,
        };

        // Add coverImage only if a new file was selected
        // Note: After compression, files become Blob objects, not File objects
        if (coverImage.length > 0 && coverImage[0] instanceof Blob) {
            submitData.coverImage = coverImage[0];
        }

        // Add images only if new files were selected
        if (images.length > 0 && images.every(img => img instanceof Blob)) {
            submitData.images = images;
        }

        console.log('🔍 [Submit Data]', {
            hasCoverImage: !!submitData.coverImage,
            coverImageType: submitData.coverImage?.constructor?.name,
            imagesCount: submitData.images?.length || 0,
            firstImageType: submitData.images?.[0]?.constructor?.name,
        });

        if (isEditMode) {
            updateProject(submitData);
        } else {
            createProject(submitData);
        }
    };

    const handleClose = () => {
        if (!isCreating && !isUpdating) {
            onOpenChange(false);
            if (!isEditMode) {
                reset();
                setCoverImage([]);
                setImages([]);
            }
        }
    };

    const isSubmitting = isCreating || isUpdating;

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>{isEditMode ? 'Edit Project' : 'Create New Project'}</DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    {/* Title */}
                    <div className="space-y-2">
                        <Label htmlFor="title">Project Title *</Label>
                        <Input
                            id="title"
                            {...register('title')}
                            placeholder="My Awesome Project"
                            disabled={isSubmitting}
                        />
                        {errors.title && (
                            <p className="text-sm text-destructive">{errors.title.message}</p>
                        )}
                    </div>

                    {/* Tagline */}
                    <div className="space-y-2">
                        <Label htmlFor="tagline">Tagline</Label>
                        <Input
                            id="tagline"
                            {...register('tagline')}
                            placeholder="A brief one-liner about your project"
                            disabled={isSubmitting}
                        />
                        {errors.tagline && (
                            <p className="text-sm text-destructive">{errors.tagline.message}</p>
                        )}
                    </div>

                    {/* Description */}
                    <div className="space-y-2">
                        <Label htmlFor="description">Description *</Label>
                        <Textarea
                            id="description"
                            {...register('description')}
                            placeholder="Describe your project in detail..."
                            rows={5}
                            disabled={isSubmitting}
                        />
                        {errors.description && (
                            <p className="text-sm text-destructive">{errors.description.message}</p>
                        )}
                    </div>

                    {/* Category & Status Row */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Category *</Label>
                            <Select
                                value={category}
                                onValueChange={(value) => setValue('category', value)}
                                disabled={isSubmitting}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select category" />
                                </SelectTrigger>
                                <SelectContent>
                                    {PROJECT_CATEGORIES.map((cat) => (
                                        <SelectItem key={cat.value} value={cat.value}>
                                            {cat.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {errors.category && (
                                <p className="text-sm text-destructive">{errors.category.message}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label>Status</Label>
                            <Select
                                value={status}
                                onValueChange={(value) => setValue('status', value)}
                                disabled={isSubmitting}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {PROJECT_STATUS.map((stat) => (
                                        <SelectItem key={stat.value} value={stat.value}>
                                            {stat.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {/* Tech Stack */}
                    <TechStackInput
                        value={techStack}
                        onChange={(value) => setValue('techStack', value)}
                        error={errors.techStack?.message}
                    />

                    {/* Cover Image */}
                    <ImageUploader
                        label="Cover Image"
                        multiple={false}
                        maxFiles={1}
                        onImagesChange={setCoverImageWithLog}
                        existingImages={existingCoverImage ? [existingCoverImage] : []}
                        onRemoveExisting={() => setExistingCoverImage(undefined)}
                    />

                    {/* Additional Images */}
                    <ImageUploader
                        label="Additional Images (Optional)"
                        multiple={true}
                        maxFiles={6}
                        onImagesChange={setImagesWithLog}
                        existingImages={existingImages}
                        onRemoveExisting={(url) => setExistingImages(prev => prev.filter(img => img !== url))}
                    />

                    {/* Date Range */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Start Date</Label>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant="outline"
                                        className={cn(
                                            'w-full justify-start text-left font-normal',
                                            !startDate && 'text-muted-foreground'
                                        )}
                                        disabled={isSubmitting}
                                    >
                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                        {startDate ? format(startDate, 'PPP') : 'Pick a date'}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0">
                                    <Calendar
                                        mode="single"
                                        selected={startDate}
                                        onSelect={(date) => setValue('startDate', date)}
                                        initialFocus
                                    />
                                </PopoverContent>
                            </Popover>
                        </div>

                        <div className="space-y-2">
                            <Label>End Date</Label>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant="outline"
                                        className={cn(
                                            'w-full justify-start text-left font-normal',
                                            !endDate && 'text-muted-foreground'
                                        )}
                                        disabled={isSubmitting}
                                    >
                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                        {endDate ? format(endDate, 'PPP') : 'Pick a date'}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0">
                                    <Calendar
                                        mode="single"
                                        selected={endDate}
                                        onSelect={(date) => setValue('endDate', date)}
                                        initialFocus
                                    />
                                </PopoverContent>
                            </Popover>
                        </div>
                    </div>

                    {/* Links */}
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="repositoryUrl">Repository URL</Label>
                            <Input
                                id="repositoryUrl"
                                {...register('repositoryUrl')}
                                placeholder="https://github.com/username/repo"
                                disabled={isSubmitting}
                            />
                            {errors.repositoryUrl && (
                                <p className="text-sm text-destructive">{errors.repositoryUrl.message}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="liveUrl">Live Demo URL</Label>
                            <Input
                                id="liveUrl"
                                {...register('liveUrl')}
                                placeholder="https://myproject.com"
                                disabled={isSubmitting}
                            />
                            {errors.liveUrl && (
                                <p className="text-sm text-destructive">{errors.liveUrl.message}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="demoVideoUrl">Demo Video URL</Label>
                            <Input
                                id="demoVideoUrl"
                                {...register('demoVideoUrl')}
                                placeholder="https://youtube.com/watch?v=..."
                                disabled={isSubmitting}
                            />
                            {errors.demoVideoUrl && (
                                <p className="text-sm text-destructive">{errors.demoVideoUrl.message}</p>
                            )}
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex justify-end gap-3">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={handleClose}
                            disabled={isSubmitting}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {isEditMode ? 'Update Project' : 'Create Project'}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}