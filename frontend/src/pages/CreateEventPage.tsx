import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { useCreateEventMutation } from '../redux/api/eventAPI';
import type { EventFormData } from '../types/eventTypes';
import { Calendar } from 'lucide-react';

const formatDateForInput = (date: Date): string => {
  const pad = (num: number) => num.toString().padStart(2, '0');
  const year = date.getFullYear();
  const month = pad(date.getMonth() + 1);
  const day = pad(date.getDate());
  const hours = pad(date.getHours());
  const minutes = pad(date.getMinutes());
  return `${year}-${month}-${day}T${hours}:${minutes}`;
};

interface ToggleSwitchProps {
  checked: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  name: string;
  id: string;
}

const ToggleSwitch = ({ checked, onChange, name, id }: ToggleSwitchProps) => {
  return (
    <label htmlFor={id} className="relative inline-flex items-center cursor-pointer">
      <input
        type="checkbox"
        name={name}
        id={id}
        checked={checked}
        onChange={onChange}
        className="sr-only peer"
      />
      {/* This div is the visible part of the toggle */}
      <div
        className="
          w-11 h-6 rounded-full 
          transition-colors duration-200
          
          // --- Default (Off) State ---
          bg-card-background border border-button-border 
          
          // --- Checked (On) State ---
          peer-checked:bg-primary-background
          outline-none
          
          // --- Focus State ---

          // --- Thumb (The moving circle) ---
          after:content-[''] after:absolute after:top-0.5 after:left-[2px] 
          after:h-5 after:w-5 after:rounded-full 
          after:bg-primary-button-background
          after:transition-all
          peer-checked:after:translate-x-full
        "
      ></div>
    </label>
  );
};

const imageOptions = [
    'https://images.pexels.com/photos/17229131/pexels-photo-17229131/free-photo-of-restaurant-table-decorated-with-red-vases-filled-with-flowers.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    'https://images.pexels.com/photos/7648221/pexels-photo-7648221.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    'https://images.pexels.com/photos/33242508/pexels-photo-33242508/free-photo-of-elegant-wedding-invitation-with-floral-bouquet.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    'https://images.pexels.com/photos/8761559/pexels-photo-8761559.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    'https://images.pexels.com/photos/1943411/pexels-photo-1943411.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    'https://images.pexels.com/photos/21413075/pexels-photo-21413075/free-photo-of-fireworks-show-over-the-stage.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2'
];

const CreateEventPage = () => {
  const navigate = useNavigate();
  const [createEvent, { isLoading }] = useCreateEventMutation();
  const now = new Date();
  const tomorrow = new Date();
  tomorrow.setDate(now.getDate() + 1);

  const [formData, setFormData] = useState<EventFormData>({
    title: '',
    description: '',
    location: '',
    start_time: formatDateForInput(now),
    end_time: formatDateForInput(tomorrow),
    capacity: 100,
    is_public: true,
    image_url: imageOptions[0],
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
        const { checked } = e.target as HTMLInputElement;
        setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
        setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleImageSelect = (url: string) => {
    setFormData(prev => ({ ...prev, image_url: url }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const newEventResponse = await createEvent({
        ...formData,
        capacity: Number(formData.capacity),
      }).unwrap();
      toast.success('Event created successfully!');
      navigate(`/events/${newEventResponse.event.id}`);
    } catch (err: any) {
      toast.error('Failed to create event.');
    }
  };

  // Consistent styles for all form inputs
  const inputStyles = "mt-1 block w-full px-3 py-2 text-text-primary bg-button-bg rounded-lg outline-none";

  return (
    <div className="container mx-auto pt-14 sm:pt-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto p-8 rounded-xl shadow-md">
        <h1 className="text-3xl font-bold mb-8">Create a New Event</h1>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium">Event Title</label>
            <input
              type="text"
              name="title"
              id="title"
              value={formData.title}
              onChange={handleChange}
              placeholder='Enter event title'
              className={inputStyles}
              required
            />
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium">Description</label>
            <textarea
              name="description"
              id="description"
              placeholder='Enter event description'
              rows={4}
              value={formData.description}
              onChange={handleChange}
              className={inputStyles}
              required
            />
          </div>

          {/* Location */}
          <div>
            <label htmlFor="location" className="block text-sm font-medium">Location</label>
            <input
              type="text"
              name="location"
              id="location"
              value={formData.location}
              onChange={handleChange}
              placeholder='Enter event location'
              className={inputStyles}
              required
            />
          </div>

          {/* Start & End Time */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="start_time" className="block text-sm font-medium">Start Time</label>
              <div className="relative mt-1">
                <input
                  type="datetime-local"
                  name="start_time"
                  id="start_time"
                  value={formData.start_time}
                  onChange={handleChange}
                  className={`${inputStyles} hide-arrows`}
                  required
                />
                <Calendar className="absolute top-1/2 right-3 text-text-primary -translate-y-1/2 h-5 w-5 pointer-events-none" />
              </div>
            </div>
            <div>
              <label htmlFor="end_time" className="block text-sm font-medium">End Time</label>
              <div className="relative mt-1">
                <input
                  type="datetime-local"
                  name="end_time"
                  id="end_time"
                  value={formData.end_time}
                  onChange={handleChange}
                  className={`${inputStyles} hide-arrows`}
                  required
                />
                <Calendar className="absolute top-1/2 right-3 -translate-y-1/2 h-5 w-5 text-text-primary pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Capacity */}
          <div>
            <label htmlFor="capacity" className="block text-sm font-medium">Capacity</label>
            <input
              type="number"
              name="capacity"
              id="capacity"
              min="1"
              value={formData.capacity}
              onChange={handleChange}
              placeholder='e.g., 100'
              className={inputStyles}
              required
            />
          </div>
          
          {/* Image Selection */}
          <div>
            <label className="block text-sm font-medium">Select an Image</label>
            <div className="mt-2 grid grid-cols-3 gap-4">
                {imageOptions.map((url, index) => (
                    <button
                        type="button"
                        key={index}
                        onClick={() => handleImageSelect(url)}
                        className={`relative rounded-lg overflow-hidden focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-800 ${formData.image_url === url ? 'ring-2 ring-offset-2 ring-gray-800' : ''}`}
                    >
                        <img src={url} alt={`Event image option ${index + 1}`} className="w-full h-24 object-cover" />
                        {formData.image_url === url && (
                            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                            </div>
                        )}
                    </button>
                ))}
            </div>
          </div>
          
          {/* Public Toggle */}
          <div className="flex items-center justify-between pt-2">
            <div>
                <label htmlFor="is_public" className="font-medium">
                    Make this event public
                </label>
                <p className="text-sm">Anyone can see and register for this event.</p>
            </div>
            <ToggleSwitch
                id="is_public"
                name="is_public"
                checked={formData.is_public}
                onChange={handleChange}
            />
          </div>

          {/* Submit */}
          <div className="pt-4">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full rounded-full bg-primary-button-background text-primary-button-text hover:bg-primary-button-hover-background py-3 px-4 border border-transparent text-lg font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-800 disabled:opacity-50"
            >
              {isLoading ? 'Creating Event...' : 'Create Event'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateEventPage;